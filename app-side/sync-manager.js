import { settingsLib } from "@zeppos/zml/base-side";
import _ from "lodash";
import { StorageService } from "../shared/utils/storage-service";

const storageService = new StorageService(settingsLib);

export class SyncManager {
  constructor() {
    this.activeRequestKeys = new Set();
  }

  async handlePullRequest(key, req, res) {
    if (this._isKeySyncing(key, res)) return;
    this.activeRequestKeys.add(key);

    try {
      if (key === "prayerTimes") {
        this._handlePrayerTimesPull(key, req, res);
      } else {
        this._handleRegularPull(key, res);
      }
    } catch (err) {
      res(
        {
          name: "PullRequestError",
          message: err.message || "Failed to handle pull request",
        },
        null
      );
    } finally {
      this.activeRequestKeys.delete(key);
    }
  }

  async handlePushRequest(key, req, res) {
    if (this._isKeySyncing(key, res)) return;
    this.activeRequestKeys.add(key);

    const { data, timestamp } = req.params;

    if (data === undefined || !timestamp) {
      res(
        {
          name: "InvalidParametersError",
          message: "Missing required parameters: data or timestamp",
        },
        null
      );
      return;
    }

    try {
      const currentValue = storageService.getItem(key, {
        returnTimestamp: true,
      });

      if (currentValue && currentValue.timestamp > timestamp) {
        this.addToPendingPull(key);
        res(
          {
            name: "NewerDataExistsError",
            message: `Setting App data for key "${key}" is newer than device data, consider pulling instead.`,
          },
          null
        );
        return;
      }

      if (!currentValue || currentValue.timestamp < timestamp) {
        storageService.setItem(key, data, { timestamp });
        res(null, { updated: true });
      } else {
        res(null, { updated: false, reason: "Current data is up-to-date" });
      }

      this.removeFromPendingPull(key);
    } catch (err) {
      console.error(`Error handling push from device for key: ${key}`, err);
      res(
        {
          name: "PushRequestError",
          message: err.message || "Failed to handle push request",
        },
        null
      );
    }
  }

  getPendingPull() {
    const pendingPull = storageService.getItem("pendingPull");
    return pendingPull || [];
  }

  setPendingPull(pendingPull) {
    storageService.setItem("pendingPull", pendingPull);
  }

  addToPendingPull(key) {
    const pendingPull = this.getPendingPull();
    if (!pendingPull.includes(key)) {
      pendingPull.push(key);
      this.setPendingPull(pendingPull);
    }
  }

  removeFromPendingPull(key) {
    const pendingPull = this.getPendingPull();
    const index = pendingPull.indexOf(key);
    if (index > -1) {
      pendingPull.splice(index, 1);
      this.setPendingPull(pendingPull);
    }
  }

  clearPendingPull() {
    storageService.removeItem("pendingPull");
  }

  removePendingPullIfUnchanged(key, originalValue) {
    const currentStorageItem = storageService.getItem(key);
    const currentValue = currentStorageItem;

    if (_.isEqual(originalValue, currentValue)) {
      this.removeFromPendingPull(key);
      return true;
    }
    return false;
  }

  _handlePrayerTimesPull(key, req, res, chunkSize = 1024 * 8) {
    const value = storageService.getItem(key, {
      returnTimestamp: true,
      stringify: true,
    });

    const chunks = this._chunkString(value.data, chunkSize);
    const totalChunks = chunks.length;
    const chunkIndex = req?.params?.chunkIndex ?? 0;

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

    if (req?.params?.complete === true) {
      if (this.removePendingPullIfUnchanged(key, JSON.parse(value.data))) {
        console.log("Prayer times pull completed for:", key);
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
      res(
        {
          name: "InvalidChunkIndexError",
          message: `Chunk index ${chunkIndex} is out of range (0-${
            totalChunks - 1
          })`,
        },
        null
      );
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

  _handleRegularPull(key, res) {
    const value = storageService.getItem(key, { returnTimestamp: true });
    res(null, value);
    this.removePendingPullIfUnchanged(key, value.data);
  }

  _chunkString(str, size) {
    const results = [];
    for (let i = 0; i < str.length; i += size) {
      results.push(str.slice(i, i + size));
    }
    return results;
  }

  _isKeySyncing(key, res) {
    if (this.activeRequestKeys.has(key)) {
      res(
        {
          name: "SyncInProgressError",
          message: `Key "${key}" is already being synced`,
        },
        null
      );
      return true;
    }
    return false;
  }
}
