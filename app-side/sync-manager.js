import { settingsLib } from "@zeppos/zml/base-side";

export class SyncManager {
  constructor({ request }) {
    this.request = request;
    this.currentlySyncingKeys = new Set();
    this.storage = settingsLib;
  }

  chunkString(str, size) {
    const results = [];
    for (let i = 0; i < str.length; i += size) {
      results.push(str.slice(i, i + size));
    }
    return results;
  }

  getPendingSync() {
    const pendingSyncStr = this.storage.getItem("pendingSync");
    return pendingSyncStr ? JSON.parse(pendingSyncStr) : {};
  }

  setPendingSync(pendingSync) {
    this.storage.setItem("pendingSync", JSON.stringify(pendingSync));
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

  async syncSettingWithDevice(key, value) {
    console.log(`Syncing key "${key}" with device.`, value);

    if (key === "prayerTimes") {
      try {
        await this.syncPrayerTimesInChunks(value);
        // only remove from pending sync if same key hasn't been updated while syncing
        const pendingSync = this.getPendingSync();
        if (pendingSync[key] === value) {
          this.removeFromPendingSync(key);
        } else {
          console.log(
            `Key "${key}" was updated while syncing. a new sync will be attempted.`
          );
          setTimeout(() => {
            this.syncPendingItems();
          }, 3000);
        }
      } catch (error) {
        this.addToPendingSync(key, value);
        console.error(
          `Chunked sync error for "${key}":`,
          error,
          "Item marked for later sync."
        );
      }
    } else {
      return this.request({
        method: `sync.${key}`,
        params: value,
      })
        .then((res) => {
          console.log(`Sync response for "${key}":`, res);
          // only remove from pending sync if same key hasn't been updated while syncing
          const pendingSync = this.getPendingSync();
          console.log("TTT", pendingSync[key], value);
          if (pendingSync[key] === value) {
            this.removeFromPendingSync(key);
          } else {
            console.log(
              `Key "${key}" was updated while syncing. a new sync will be attempted.`
            );
            setTimeout(() => {
              this.syncPendingItems();
            }, 3000);
          }
        })
        .catch(async (error) => {
          this.addToPendingSync(key, value);
          console.error(
            `Sync error for "${key}":`,
            error,
            "Item marked for later sync."
          );
        });
    }
  }

  async syncPendingItems() {
    const pendingSync = this.getPendingSync();
    const keys = Object.keys(pendingSync);
    if (keys.length === 0) return;

    for (const key of keys) {
      if (this.currentlySyncingKeys.has(key)) {
        continue;
      }
      this.currentlySyncingKeys.add(key);

      try {
        await this.syncSettingWithDevice(key, pendingSync[key]);
      } catch (error) {
        console.error(`Failed to sync pending item "${key}":`, error);
      } finally {
        this.currentlySyncingKeys.delete(key);
      }
    }
  }

  async syncPrayerTimesInChunks(prayerTimes, chunkSize = 8192) {
    const chunks = this.chunkString(prayerTimes, chunkSize);

    for (let i = 0; i < chunks.length; i++) {
      try {
        console.log(`Sending chunk ${i + 1}/${chunks.length}`);
        await this.request({
          method: "sync.prayerTimes",
          params: {
            chunkIndex: i,
            totalChunks: chunks.length,
            complete: false,
            data: chunks[i],
          },
        });
      } catch (error) {
        console.error(`Error sending chunk ${i + 1}:`, error);
        throw error;
      }
    }

    try {
      await this.request({
        method: "sync.prayerTimes",
        params: {
          chunkIndex: null,
          totalChunks: chunks.length,
          complete: true,
          data: null,
        },
      }).then(() => {
        console.log("All chunks sent and received by the device.");
      });
    } catch (error) {
      console.error("Error notifying device of completed sync:", error);
      throw error;
    }
  }
}

export default SyncManager;
