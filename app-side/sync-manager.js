import { settingsLib } from "@zeppos/zml/base-side";

export class SyncManager {
  constructor() {
    this.currentlySyncingKeys = new Set();
  }

  chunkString(str, size) {
    const results = [];
    for (let i = 0; i < str.length; i += size) {
      results.push(str.slice(i, i + size));
    }
    return results;
  }

  getPendingSync() {
    const pendingSyncStr = settingsLib.getItem("pendingSync");
    return pendingSyncStr ? JSON.parse(pendingSyncStr) : {};
  }

  getPendingSyncKeys() {
    const pendingSync = this.getPendingSync();
    const keys = Object.keys(pendingSync);
    return keys;
  }

  setPendingSync(pendingSync) {
    settingsLib.setItem("pendingSync", JSON.stringify(pendingSync));
  }

  addToPendingSync(key, value) {
    const pendingSync = this.getPendingSync();
    pendingSync[key] = value;
    this.setPendingSync(pendingSync);
  }

  removeFromPendingSync(key) {
    const pendingSync = this.getPendingSync();
    delete pendingSync[key];
    this.setPendingSync(pendingSync);
  }

  removePendingIfUnchanged(key, originalValue) {
    const recentPendingSync = this.getPendingSync();
    const recentValue = recentPendingSync[key];
    if (recentValue === originalValue) {
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
    if (!(key in pendingSync)) {
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
    const value = pendingSync[key];
    console.log("Syncing key: ", key);

    try {
      if (key === "prayerTimes") {
        this._handlePrayerTimesChunkSync(key, value, req, res);
      } else {
        this._handleDefaultSync(key, value, res);
      }
    } catch (err) {
      res({ type: "exception", error: err.message }, null);
    } finally {
      this.currentlySyncingKeys.delete(key);
    }
  }

  _handlePrayerTimesChunkSync(key, value, req, res) {
    const chunkSize = 8192;
    const chunks = this.chunkString(value, chunkSize);
    const totalChunks = chunks.length;
    const chunkIndex = req?.params?.chunkIndex ?? 0;

    if (chunkIndex < 0 || chunkIndex >= totalChunks) {
      res({ type: "invalid_chunk_index", error: "Invalid chunk index." }, null);
      return;
    }

    res(null, {
      chunkIndex,
      totalChunks,
      complete: false,
      data: chunks[chunkIndex],
    });

    // If the device notifies completion, remove from pendingSync only if value unchanged
    if (req?.params?.complete === true) {
      if (this.removePendingIfUnchanged(key, value)) {
        console.log("Syncing complete for key:", key);
      } else {
        console.log("prayerTimes updated during sync, keeping in pendingSync");
      }
    }
  }

  _handleDefaultSync(key, value, res) {
    res(null, { data: value });
    this.removePendingIfUnchanged(key, value);
  }
}
