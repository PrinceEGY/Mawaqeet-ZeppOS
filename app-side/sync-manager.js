import { settingsLib } from "@zeppos/zml/base-side";
import _ from "lodash";
import { StorageService } from "../shared/utils/storage-service";

const storageService = new StorageService(settingsLib);

export class SyncManager {
  constructor() {
    this.currentlySyncingKeys = new Set();
  }

  getPendingSync() {
    const pendingSync = storageService.getItem("pendingSync");
    return pendingSync || [];
  }

  setPendingSync(pendingSync) {
    storageService.setItem("pendingSync", pendingSync);
  }

  addToPendingSync(key) {
    const pendingSync = this.getPendingSync();
    if (!pendingSync.includes(key)) {
      pendingSync.push(key);
      console.debug("Adding to pendingSync:", key);
      this.setPendingSync(pendingSync);
    }
  }

  removeFromPendingSync(key) {
    const pendingSync = this.getPendingSync();
    const index = pendingSync.indexOf(key);
    if (index > -1) {
      pendingSync.splice(index, 1);
      this.setPendingSync(pendingSync);
    }
  }

  clearPendingSync() {
    storageService.removeItem("pendingSync");
  }

  removePendingIfUnchanged(key, originalValue) {
    const currentStorageItem = storageService.getItem(key);
    const currentValue = currentStorageItem;
    console.debug(
      `Checking if value for key "${key}" has changed. Original: ${JSON.stringify(
        originalValue
      )}, Current: ${JSON.stringify(currentValue)}`
    );
    if (_.isEqual(originalValue, currentValue)) {
      console.debug(
        `Value for key "${key}" has not changed, removing from pendingSync.`
      );
      this.removeFromPendingSync(key);
      return true;
    }
    return false;
  }

  async handleSyncRequest(key, req, res) {
    if (this.currentlySyncingKeys.has(key)) {
      res(
        { type: "already_syncing", error: "This key is already being synced." },
        null
      );
      return;
    }

    const pendingSync = this.getPendingSync();
    if (!pendingSync.includes(key)) {
      res(
        {
          type: "not_pending",
          error: "Key is either not existing or already synced.",
        },
        null
      );
      return;
    }

    this.currentlySyncingKeys.add(key);
    console.debug("Syncing key: ", key);

    try {
      if (key === "prayerTimes") {
        this._handlePrayerTimesChunkSync(key, req, res);
      } else {
        this._handleRegularSync(key, res);
      }
    } catch (err) {
      res({ type: "exception", error: err.message }, null);
    } finally {
      this.currentlySyncingKeys.delete(key);
    }
  }

  _handlePrayerTimesChunkSync(key, req, res, chunkSize = 1024 * 8) {
    const value = storageService.getItem(key, true, true);

    const chunks = this._chunkString(value.data, chunkSize);
    const totalChunks = chunks.length;
    const chunkIndex = req?.params?.chunkIndex ?? 0;

    console.log(
      `Syncing prayerTimes: totalChunks=${totalChunks}, chunkIndex=${chunkIndex}`
    );

    // Metadata request
    if (chunkIndex == -1) {
      res(null, {
        dataLength: value.data.length,
        chunkIndex: -1,
        totalChunks,
        complete: false,
        data: null,
        timestamp: value.timestamp,
      });
      return;
    }

    // If the device notifies completion, remove from pendingSync only if value unchanged
    if (req?.params?.complete === true) {
      if (this.removePendingIfUnchanged(key, value)) {
        console.log("Syncing complete for key:", key);
      } else {
        console.log("prayerTimes updated during sync, keeping in pendingSync");
      }
      res(null, {
        dataLength: value.data.length,
        chunkIndex: -1,
        totalChunks,
        complete: true,
        data: null,
        timestamp: value.timestamp,
      });
      return;
    }

    if (chunkIndex < 0 || chunkIndex >= totalChunks) {
      res({ type: "invalid_chunk_index", error: "Invalid chunk index." }, null);
      return;
    }

    res(null, {
      dataLength: value.data.length,
      chunkIndex,
      totalChunks,
      complete: false,
      data: chunks[chunkIndex],
      timestamp: value.timestamp,
    });
  }

  _handleRegularSync(key, res) {
    const value = storageService.getItem(key, true);
    res(null, value);
    this.removePendingIfUnchanged(key, value.data);
  }

  _chunkString(str, size) {
    const results = [];
    for (let i = 0; i < str.length; i += size) {
      results.push(str.slice(i, i + size));
    }
    return results;
  }
}
