import { BaseSideService } from "@zeppos/zml/base-side";
import { SYNC_SETTINGS_LIST } from "../shared/constants";
import { GeoService } from "../shared/utils/geo-service";
import { PrayersService } from "../shared/utils/prayers-service";
import { StorageService } from "../shared/utils/storage-service";
import { SyncManager } from "./sync-manager";

const syncManager = new SyncManager();
const storageService = new StorageService(settings.settingsStorage);
const prayersService = new PrayersService(storageService);

AppSideService(
  BaseSideService({
    onInit() {
      console.debug("App side service initialized");
    },

    onRun() {
      console.debug("App side service running");
      setTimeout(() => {
        this.triggerSync();
      }, 1000);
    },

    onDestroy() {},

    async onRequest(req, res) {
      try {
        switch (req.method) {
          case "fetchPrayerTimes":
            await prayersService.fetchAndSavePrayerTimes({});
            res(null, { status: "success" });
            break;
          case "getCurrentLocation": {
            const currentLocation = storageService.getItem("currentLocation");

            res(null, { location: currentLocation });
            break;
          }
          case "getCityByGeoLocation": {
            const { latitude, longitude } = req.params;
            const closestCity = GeoService.getClosestCity(latitude, longitude);
            res(null, { city: closestCity });
            break;
          }
          case "getPendingSync":
            keys = syncManager.getPendingSync();
            res(null, { keys });
            break;
          default:
            if (req.method && req.method.startsWith("sync.")) {
              const key = req.method.split(".")[1];
              await syncManager.handleSyncRequest(key, req, res);
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
      console.warn("Settings changed:", { key, newValue, oldValue });

      if (key === "triggerSync") {
        this.triggerSync();
      }

      if (
        newValue &&
        newValue !== oldValue &&
        SYNC_SETTINGS_LIST.includes(key)
      ) {
        console.debug(`Syncing setting change for key: ${key}`);
        syncManager.addToPendingSync(key);
        this.triggerSync([key]);
      }

      if (
        (key === "currentLocation" || key === "calculationMethod") &&
        newValue !== oldValue &&
        newValue
      ) {
        await prayersService.fetchAndSavePrayerTimes();
        console.log(`Prayer times updated due to "${key}" change:`);
        this.onSettingsChange({
          key: "prayerTimes",
          newValue: storageService.getItem("prayerTimes"),
          oldValue: null,
        });
      }
    },

    async triggerSync(keys) {
      const syncKeys = keys || syncManager.getPendingSync();
      console.log("Triggering sync with keys:", syncKeys);
      if (!syncKeys || syncKeys.length === 0) {
        console.log("No pending sync keys to trigger.");
        return;
      }
      this.call({ method: "sync.triggerSync", keys: syncKeys });
    },
  })
);
