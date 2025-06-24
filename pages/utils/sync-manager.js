import { log as Logger } from "@zos/utils";
import { PrayersService } from "./prayers-service";
import { StorageService } from "./storage-service";

const logger = Logger.getLogger("sync-manager");
const storage = new StorageService();

export class SyncManager {
  constructor(request) {
    this.request = request;
    this.currentSyncKeys = new Set();
  }

  triggerSync(syncKeys) {
    if (syncKeys && syncKeys.length > 0) {
      logger.info("Sync keys provided, performing sync:", syncKeys);
      this._performSync(syncKeys);
      return;
    }

    logger.info("No sync keys provided, fetching pending sync keys.");
    this.request({ method: "getPendingSync" })
      .then((res) => {
        this._performSync(res.keys || []);
      })
      .catch((error) => {
        logger.error("Error fetching pending sync keys:", error);
        return [];
      });
  }

  _performSync(syncKeys) {
    if (!syncKeys || syncKeys.length === 0) return;

    syncKeys.forEach((key) => {
      if (this.currentSyncKeys.has(key)) {
        logger.warn(`Already syncing key: ${key}`);
        return;
      }

      if (key === "prayerTimes") {
        this._handlePrayerTimesSync(key);
      } else {
        this._handleRegularSync(key);
      }
    });
  }

  _handleRegularSync(key) {
    this.currentSyncKeys.add(key);
    this.request({ method: `sync.${key}`, params: {} })
      .then((res) => {
        logger.debug(`Sync response for ${key}:`, res);
        const currentValue = storage.getItem(key, true);
        if (currentValue.timestamp < res.timestamp)
          storage.setItem(key, res.data, res.timestamp);
        else {
          logger.info(
            `The current data for key: ${key} is newer than the synced data.`
          );
          // TODO: sync with settings app
        }
      })
      .catch((error) => {
        logger.error(`Error syncing ${key}:`, error);
      })
      .finally(() => {
        this.currentSyncKeys.delete(key);
      });
  }

  _handlePrayerTimesSync(key) {
    this.currentSyncKeys.add(key);

    this._getPrayerTimesSyncMetaData(key)
      .then(({ totalChunks, expectedDataLength }) => {
        if (totalChunks === 0 || expectedDataLength === 0) {
          logger.info("No prayer times chunks to sync.");
          return;
        }

        this._fetchPrayerTimesChunks(key, totalChunks, expectedDataLength).then(
          (chunks) => {
            this._processPrayerTimesData(key, chunks, expectedDataLength);
          }
        );
      })
      .catch((error) => {
        logger.error(`Error fetching prayer times metadata: ${error}`);
      })
      .finally(() => {
        this.currentSyncKeys.delete(key);
      });
  }

  _getPrayerTimesSyncMetaData(key) {
    return this.request({
      method: `sync.${key}`,
      params: { chunkIndex: -1 },
    }).then((res) => {
      logger.log(JSON.stringify(res));
      return {
        totalChunks: res.totalChunks,
        expectedDataLength: res.dataLength,
        timestamp: res.timestamp,
      };
    });
  }

  _fetchPrayerTimesChunks(key, totalChunks) {
    let chunks = new Array(totalChunks).fill("");

    const chunkPromises = Array.from({ length: totalChunks }, (_, i) =>
      this.request({ method: `sync.${key}`, params: { chunkIndex: i } })
        .then((chunkRes) => {
          chunks[i] = chunkRes.data || "";
          logger.debug(
            `Received prayer times chunk ${i + 1}/${totalChunks}: ${
              chunks[i].length
            } bytes`
          );
        })
        .catch((error) => {
          logger.error(`Error syncing prayer times chunk ${i + 1}: `, error);
          throw error;
        })
    );

    return Promise.all(chunkPromises).then(() => chunks);
  }

  _processPrayerTimesData(key, chunks, expectedDataLength) {
    const prayerTimesString = chunks.join("");

    if (prayerTimesString.length !== expectedDataLength) {
      logger.error(
        `Received prayer times data length mismatch: expected ${expectedDataLength} bytes, got ${prayerTimesString.length} bytes`
      );
      return;
    }

    logger.info(
      `Received all prayer times chunks: ${prayerTimesString.length} bytes`
    );
    const success = PrayersService.savePrayerTimes(prayerTimesString);

    if (success) {
      this.request({ method: `sync.${key}`, params: { complete: true } });
      logger.info("Prayer times sync completed successfully.");
    } else {
      logger.error("Failed to save prayer times data");
    }
  }
}
