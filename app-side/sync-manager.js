import _ from "lodash";
import { StorageService } from "../shared/utils/storage-service";

const storageService = new StorageService(settings.settingsStorage);

export class SyncManager {
  constructor() {
    this.activeRequestKeys = new Set();
  }

  async handlePullRequest(key, req, res) {
    if (this._isKeySyncing(key, res)) return;
    this.activeRequestKeys.add(key);

    try {
      if (!storageService.hasItem(key)) {
        res(
          {
            name: "KeyNotFoundError",
            message: `Key "${key}" does not exist in storage`,
          },
          null
        );
        return;
      }

      const value = storageService.getItem(key, { returnTimestamp: true });
      res(null, value);
      this._cleanupPendingPullIfUnchanged(key, value.data);
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
      this.activeRequestKeys.delete(key);
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

      this._cleanupPendingPullIfUnchanged(key, data);
    } catch (err) {
      console.error(`Error handling push from device for key: ${key}`, err);
      res(
        {
          name: "PushRequestError",
          message: err.message || "Failed to handle push request",
        },
        null
      );
    } finally {
      this.activeRequestKeys.delete(key);
    }
  }

  getPendingPull() {
    return storageService.getItem("pendingPull") || [];
  }

  addToPendingPull(key) {
    const pendingPull = this.getPendingPull();
    if (!pendingPull.includes(key)) {
      pendingPull.push(key);
      storageService.setItem("pendingPull", pendingPull);
    }
  }

  removeFromPendingPull(key) {
    const pendingPull = this.getPendingPull();
    const index = pendingPull.indexOf(key);
    if (index > -1) {
      pendingPull.splice(index, 1);
      storageService.setItem("pendingPull", pendingPull);
    }
  }

  clearPendingPull() {
    storageService.removeItem("pendingPull");
  }

  _cleanupPendingPullIfUnchanged(key, originalValue) {
    const currentValue = storageService.getItem(key);
    if (_.isEqual(originalValue, currentValue)) {
      this.removeFromPendingPull(key);
    }
  }

  isSyncing() {
    return this.activeRequestKeys.size > 0;
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
