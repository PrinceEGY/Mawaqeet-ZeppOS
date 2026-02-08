import { DeviceLogger } from "./device-logger";
import { StorageService } from "./storage-service";

const logger = new DeviceLogger("sync-manager");

export class SyncManager {
  constructor(request, call) {
    this.request = request;
    this.call = call;
    this.activePullKeys = new Set();
    this.activePushKeys = new Set();
    this.syncCheckInterval = null;
    this.onSyncStateChange = null;
  }

  reset() {
    if (this.syncCheckInterval) {
      clearInterval(this.syncCheckInterval);
      this.syncCheckInterval = null;
    }
    this.activePullKeys.clear();
    this.activePushKeys.clear();
    this.onSyncStateChange?.(false);
  }

  /**
   * Pull data from setting app for specified keys
   * @param {string|string[]} keys - Optional single key or array of keys to pull. If not provided, fetches pending pull keys from setting app.
   */
  pullFromSettingApp(keys) {
    if (!keys) {
      this._getPendingPullKeys().then((pendingKeys) => {
        if (pendingKeys.length > 0) {
          logger.debug("Pulling pending keys from setting app:", pendingKeys);
          this._executePull(pendingKeys);
        } else {
          logger.debug("No pending keys to pull from setting app");
        }
      });
      return;
    }

    const syncKeys = this._toArray(keys);
    if (syncKeys.length === 0) return;

    this._executePull(syncKeys);
  }

  _executePull(syncKeys) {
    const wasIdle = this.activePullKeys.size === 0 && this.activePushKeys.size === 0;

    syncKeys.forEach((key) => {
      if (this.activePullKeys.has(key)) {
        logger.warn(`Already pulling key: ${key}`);
        return;
      }

      this.activePullKeys.add(key);
      this._pullKey(key);
    });

    if (wasIdle && this.activePullKeys.size > 0) {
      this.onSyncStateChange?.(true);
    }
  }

  /**
   * Push local changes to setting app
   * @param {string|string[]} keys - Optional single key or array of keys to push. If not provided, pushes all pending keys.
   */
  pushToSettingApp(keys) {
    const keysToSync = keys ? this._toArray(keys) : this._getPendingPush();

    if (keysToSync.length === 0) return;

    logger.debug("Pushing to setting app:", keysToSync);
    this._executePush(keysToSync);
  }

  _executePush(syncKeys) {
    const wasIdle = this.activePullKeys.size === 0 && this.activePushKeys.size === 0;

    syncKeys.forEach((key) => {
      if (this.activePushKeys.has(key)) {
        logger.warn(`Already pushing key: ${key}`);
        return;
      }
      this.activePushKeys.add(key);
      this._pushKey(key);
    });

    if (wasIdle && this.activePushKeys.size > 0) {
      this.onSyncStateChange?.(true);
    }
  }

  /**
   * Get pending pull keys from setting app
   * @returns {Promise<string[]>} Promise resolving to array of keys that need to be pulled
   */
  _getPendingPullKeys() {
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

    if (this.syncCheckInterval) {
      clearInterval(this.syncCheckInterval);
    }

    this.syncCheckInterval = setInterval(() => {
      if (this.activePullKeys.size === 0) {
        clearInterval(this.syncCheckInterval);
        this.syncCheckInterval = null;

        this.pushToSettingApp();
      }
    }, 200);
  }

  _getPendingPush() {
    return StorageService.getItem("pendingPush") || [];
  }

  _setPendingPush(pendingPush) {
    StorageService.setItem("pendingPush", pendingPush, { markForPush: false });
  }

  _addToPendingPush(key) {
    const pendingPush = this._getPendingPush();
    if (!pendingPush.includes(key)) {
      pendingPush.push(key);
      this._setPendingPush(pendingPush);
    }
  }

  _removeFromPendingPush(key) {
    const pendingPush = this._getPendingPush();
    const index = pendingPush.indexOf(key);
    if (index > -1) {
      pendingPush.splice(index, 1);
      this._setPendingPush(pendingPush);
    }
  }

  _cleanupPendingPushIfUnchanged(key, originalValue) {
    const currentStorageItem = StorageService.getItem(key, {
      returnTimestamp: true,
    });
    const currentValue = currentStorageItem?.data;

    const originalStr = JSON.stringify(originalValue);
    const currentStr = JSON.stringify(currentValue);

    if (originalStr === currentStr) {
      this._removeFromPendingPush(key);
      return true;
    }
    return false;
  }

  isSyncing() {
    return this.activePullKeys.size > 0 || this.activePushKeys.size > 0;
  }

  destroy() {
    this.reset();
    this.request = null;
    this.call = null;
    logger.debug("SyncManager destroyed");
  }

  _toArray(keys) {
    if (!keys) return [];
    return Array.isArray(keys) ? keys : [keys];
  }

  _checkSyncComplete() {
    if (this.activePullKeys.size === 0 && this.activePushKeys.size === 0) {
      this.onSyncStateChange?.(false);
    }
  }

  _pushKey(key) {
    const currentValue = StorageService.getItem(key, { returnTimestamp: true });
    if (!currentValue || currentValue.data === undefined) {
      logger.debug(`No data found for key: ${key}, removing from pending push`);
      this._cleanupPendingPushIfUnchanged(key, currentValue?.data);
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
        if (res) this._cleanupPendingPushIfUnchanged(key, currentValue.data);
      })
      .catch((error) => {
        if (error && error.name === "NewerDataExistsError") {
          logger.info(`Setting app has newer data for ${key}.`);
        } else {
          logger.error(`Error pushing ${key} to setting app:`, error);
        }
      })
      .finally(() => {
        this.activePushKeys.delete(key);
        this._checkSyncComplete();
      });
  }

  _pullKey(key) {
    this.request({ method: `pull.${key}`, params: {} })
      .then((res) => {
        const currentValue = StorageService.getItem(key, {
          returnTimestamp: true,
        });

        if (!currentValue || currentValue.timestamp < res.timestamp) {
          StorageService.setItem(key, res.data, {
            timestamp: res.timestamp,
            markForPush: false,
          });
          this._cleanupPendingPushIfUnchanged(key, res.data);
          logger.info(`Updated ${key} with newer data from setting app`);
        } else if (currentValue.timestamp > res.timestamp) {
          logger.info(`Local ${key} is newer, keeping for push`);
          this._addToPendingPush(key);
        } else {
          this._cleanupPendingPushIfUnchanged(key, res.data);
        }
      })
      .catch((error) => logger.error(`Error pulling ${key}:`, error))
      .finally(() => {
        this.activePullKeys.delete(key);
        this._checkSyncComplete();
      });
  }
}
