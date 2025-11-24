import { log as Logger } from "@zos/utils";
import { PrayersService } from "./prayers-service";
import { StorageService } from "./storage-service";

const logger = Logger.getLogger("sync-manager");
const storage = new StorageService();

export class SyncManager {
  constructor(request, call) {
    this.request = request;
    this.call = call;
    this.activePullKeys = new Set(); // Keys currently being pulled
    this.activePushKeys = new Set(); // Keys currently being pushed
  }
  /**
   * Pull data from setting app for specified keys
   * @param {string|string[]} keys - Optional single key or array of keys to pull. If not provided, fetches pending pull keys from setting app.
   */
  pullFromSettingApp(keys) {
    if (!keys) {
      this.getPendingPullKeys().then((pendingKeys) => {
        if (pendingKeys.length > 0) {
          logger.debug("Pulling pending keys from setting app:", pendingKeys);
          this._executePull(pendingKeys);
        }
      });
      return;
    }

    const syncKeys = this._normalizeKeys(keys);
    if (syncKeys.length === 0) return;

    this._executePull(syncKeys);
  }

  _executePull(syncKeys) {
    syncKeys.forEach((key) => {
      if (this.activePullKeys.has(key)) {
        logger.warn(`Already pulling key: ${key}`);
        return;
      }

      this.activePullKeys.add(key);
      if (key === "prayerTimes") {
        this._pullPrayerTimes(key);
      } else {
        this._pullKey(key);
      }
    });
  }

  /**
   * Push local changes to setting app
   * @param {string|string[]} keys - Optional single key or array of keys to push. If not provided, pushes all pending keys.
   */
  pushToSettingApp(keys) {
    const keysToSync = keys ? this._normalizeKeys(keys) : this.getPendingPush();

    if (keysToSync.length === 0) return;

    logger.debug("Pushing to setting app:", keysToSync);
    this._executePush(keysToSync);
  }

  _executePush(syncKeys) {
    syncKeys.forEach((key) => {
      if (this.activePushKeys.has(key)) {
        logger.warn(`Already pushing key: ${key}`);
        return;
      }
      this.activePushKeys.add(key);
      this._pushKey(key);
    });
  }

  /**
   * Get pending pull keys from setting app
   * @returns {Promise<string[]>} Promise resolving to array of keys that need to be pulled
   */
  getPendingPullKeys() {
    return this.request({ method: "getPendingPull" })
      .then((res) => res.keys || [])
      .catch((error) => {
        logger.error("Error getting pending pull keys:", error);
        return [];
      });
  }

  /**
   * Performs full bidirectional sync: pulls pending keys from setting app, then pushes local changes.
   * For syncing specific keys, use pullFromSettingApp(keys) instead.
   */
  triggerFullSync() {
    logger.log("Triggering full sync");

    this.pullFromSettingApp();

    // Wait for pull operations to complete
    const checkInterval = setInterval(() => {
      if (this.activePullKeys.size === 0) {
        clearInterval(checkInterval);

        this.pushToSettingApp();
      }
    }, 200);
  }

  getPendingPush() {
    const pendingPush = storage.getItem("pendingPush");
    return pendingPush || [];
  }

  setPendingPush(pendingPush) {
    storage.setItem("pendingPush", pendingPush);
  }

  addToPendingPush(key) {
    const pendingPush = this.getPendingPush();
    if (!pendingPush.includes(key)) {
      pendingPush.push(key);
      this.setPendingPush(pendingPush);
    }
  }

  removeFromPendingPush(key) {
    const pendingPush = this.getPendingPush();
    const index = pendingPush.indexOf(key);
    if (index > -1) {
      pendingPush.splice(index, 1);
      this.setPendingPush(pendingPush);
    }
  }

  clearPendingPush() {
    storage.removeItem("pendingPush");
  }

  removePendingPushIfUnchanged(key, originalValue) {
    const currentStorageItem = storage.getItem(key, true);
    const currentValue = currentStorageItem?.data;

    const originalStr = JSON.stringify(originalValue);
    const currentStr = JSON.stringify(currentValue);

    if (originalStr === currentStr) {
      this.removeFromPendingPush(key);
      return true;
    }
    return false;
  }

  _normalizeKeys(keys) {
    if (!keys) return [];
    return Array.isArray(keys) ? keys : [keys];
  }

  _pushKey(key) {
    const currentValue = storage.getItem(key, true);
    if (!currentValue || currentValue.data === undefined) {
      logger.debug(`No data found for key: ${key}, removing from pending push`);
      this.removePendingPushIfUnchanged(key, currentValue?.data);
      this.activePushKeys.delete(key);
      return;
    }

    this.request({
      method: `push.${key}`,
      params: {
        data: currentValue.data,
        timestamp: currentValue.timestamp,
      },
    })
      .then((res) => {
        if (res) this.removePendingPushIfUnchanged(key, currentValue.data);
      })
      .catch((error) => {
        if (error && error.name === "NewerDataExistsError") {
          logger.info(`Setting app has newer data for ${key}.`);
          // TODO: perform a pull?
        } else {
          logger.error(`Error pushing ${key} to setting app:`, error);
        }
      })
      .finally(() => {
        this.activePushKeys.delete(key);
      });
  }

  _pullKey(key) {
    this.request({ method: `pull.${key}`, params: {} })
      .then((res) => {
        const currentValue = storage.getItem(key, true);

        if (!currentValue || currentValue.timestamp < res.timestamp) {
          storage.setItem(key, res.data, res.timestamp, false);
          this.removeFromPendingPush(key);
          logger.info(`Updated ${key} with newer data from setting app`);
        } else if (currentValue.timestamp > res.timestamp) {
          logger.info(`Local ${key} is newer, keeping for push`);
          this.addToPendingPush(key);
        } else {
          // timestamps are equal (data is the same)
          this.removeFromPendingPush(key);
        }
      })
      .catch((error) => logger.error(`Error pulling ${key}:`, error))
      .finally(() => {
        this.activePullKeys.delete(key);
      });
  }

  _pullPrayerTimes(key) {
    this._getPrayerTimesPullMetadata(key)
      .then(({ totalChunks, expectedDataLength, timestamp }) => {
        if (totalChunks === 0 || expectedDataLength === 0) {
          return;
        }

        const currentValue = storage.getItem(key, true);
        if (currentValue && currentValue.timestamp >= timestamp) {
          logger.info("Local prayer times is newer, skipping pull!");
          return;
        }

        this._pullPrayerTimesChunks(key, totalChunks, expectedDataLength).then(
          (chunks) => {
            this._processPrayerTimesData(key, chunks, expectedDataLength);
          }
        );
      })
      .catch((error) => {
        logger.error(`Error pulling prayer times for key: ${key}`, error);
      })
      .finally(() => {
        this.activePullKeys.delete(key);
      });
  }

  _getPrayerTimesPullMetadata(key) {
    return this.request({
      method: `pull.${key}`,
      params: { chunkIndex: -1 },
    }).then((res) => {
      return {
        totalChunks: res.totalChunks,
        expectedDataLength: res.dataLength,
        timestamp: res.timestamp,
      };
    });
  }

  _pullPrayerTimesChunks(key, totalChunks) {
    const chunks = new Array(totalChunks).fill("");

    const chunkPromises = Array.from({ length: totalChunks }, (_, i) =>
      this.request({ method: `pull.${key}`, params: { chunkIndex: i } })
        .then((chunkRes) => {
          chunks[i] = chunkRes.data || "";
        })
        .catch((error) => {
          logger.error(`Error pulling prayer times chunk ${i + 1}: `, error);
          throw error;
        })
    );

    return Promise.all(chunkPromises).then(() => chunks);
  }

  _processPrayerTimesData(key, chunks, expectedDataLength) {
    const prayerTimesString = chunks.join("");

    if (prayerTimesString.length !== expectedDataLength) {
      logger.error(
        `Prayer times data length mismatch: expected ${expectedDataLength}, got ${prayerTimesString.length}`
      );
      return;
    }

    const success = PrayersService.savePrayerTimes(prayerTimesString, false);

    if (success) {
      this.request({ method: `pull.${key}`, params: { complete: true } });
      logger.info("Prayer times pull completed successfully");
    } else {
      logger.error("Failed to save prayer times data");
    }
  }
}
