import { BaseSideService, settingsLib } from "@zeppos/zml/base-side";
import { SYNC_SETTINGS_LIST } from "../shared/constants";
import { GeoService } from "../shared/geo-service";
import { fetchAndSavePrayerTimes } from "../shared/helpers";
import { SyncManager } from "./sync-manager";

AppSideService(
  BaseSideService({
    onInit() {
      console.log("App side service initialized");
      this.syncManager = new SyncManager();
    },

    onRun() {
      console.log("App side service running");
      console.log("Syncing keys: ", this.syncManager.getPendingSync());
      setTimeout(() => {
        this.triggerSync();
      }, 1000);
    },

    onDestroy() {},

    async onRequest(req, res) {
      try {
        switch (req.method) {
          case "fetchPrayerTimes":
            await fetchAndSavePrayerTimes({ storage: settingsLib });
            res(null, { status: "success" });
            break;
          case "getCurrentLocation": {
            const currentLocation = JSON.parse(
              settingsLib.getItem("currentLocation")
            );
            res(null, { location: currentLocation });
            break;
          }
          case "getCityByGeoLocation": {
            const { latitude, longitude } = req.params;
            const closestCity = GeoService.getClosestCity(latitude, longitude);
            res(null, { city: closestCity });
            break;
          }
          case "getPendingSyncKeys":
            keys = this.syncManager.getPendingSyncKeys();
            res(null, { keys });
            break;
          default:
            if (req.method && req.method.startsWith("sync.")) {
              const key = req.method.split(".")[1];
              await this.syncManager.handleSyncRequest(key, req, res);
            } else {
              res({ error: "Unknown method" }, null);
            }
        }
      } catch (error) {
        console.error("onRequest error:", error);
        res(error, null);
      }
    },

    async onSettingsChange({ key, newValue, oldValue }) {
      console.log("Settings changed:", { key, newValue, oldValue });

      if (key === "triggerSync") {
        this.triggerSync();
      }

      if (
        newValue &&
        newValue !== oldValue &&
        SYNC_SETTINGS_LIST.includes(key)
      ) {
        console.log(`Syncing setting change for key: ${key}`);
        this.syncManager.addToPendingSync(key, newValue);
        this.triggerSync([key]);
      }

      if (
        (key === "currentLocation" || key === "calculationMethod") &&
        newValue !== oldValue &&
        newValue
      ) {
        await fetchAndSavePrayerTimes({ storage: settingsLib });
        console.log(`Prayer times updated due to "${key}" change:`);
        this.onSettingsChange({
          key: "prayerTimes",
          newValue: settingsLib.getItem("prayerTimes"),
          oldValue: null,
        });
      }
    },

    async triggerSync(keys) {
      const syncKeys = keys || this.syncManager.getPendingSyncKeys();
      if (!syncKeys || syncKeys.length === 0) {
        console.log("No pending sync keys to trigger.");
        return;
      }
      this.call({ method: "sync.triggerSync", keys: syncKeys });
    },
  })
);
