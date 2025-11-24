import { BaseSideService } from "@zeppos/zml/base-side";
import { SYNC_SETTINGS_LIST } from "../shared/constants";
import { GeoService } from "../shared/utils/geo-service";
import { PrayersService } from "../shared/utils/prayers-service";
import { StorageService } from "../shared/utils/storage-service";
import { SyncManager } from "./sync-manager";

const syncManager = new SyncManager();
let storageService;
let prayersService;

function initializeServices() {
  if (!storageService) {
    storageService = new StorageService(settings.settingsStorage);
    prayersService = new PrayersService(storageService);
  }
}

AppSideService(
  BaseSideService({
    onInit() {
      console.debug("App side service initialized");
      initializeServices();
    },

    onRun() {
      console.debug("App side service running");
      isAppInitialized = storageService.getItem("__app_initialized__");
      if (isAppInitialized) {
        setTimeout(() => {
          prayersService.updateOutdatedItems();
        }, 2000);
      }
    },

    onDestroy() {},

    async onRequest(req, res) {
      try {
        switch (req.method) {
          case "fetchPrayerTimes":
            await prayersService.fetchAndSavePrayerTimes({});
            res(null, { status: "success" });
            break;
          case "updateOutdatedItems":
            await prayersService.updateOutdatedItems();
            res(null, { status: "success" });
            break;
          case "getCityByGeoLocation": {
            const { latitude, longitude } = req.params;
            const closestCity = GeoService.getClosestCity(latitude, longitude);
            res(null, { city: closestCity });
            break;
          }
          case "getPendingPull": {
            const keys = syncManager.getPendingPull();
            res(null, { keys });
            break;
          }
          default:
            if (req.method && req.method.startsWith("pull.")) {
              const key = req.method.split(".")[1];
              await syncManager.handlePullRequest(key, req, res);
            } else if (req.method && req.method.startsWith("push.")) {
              const key = req.method.split(".")[1];
              await syncManager.handlePushRequest(key, req, res);
            } else {
              res(
                { name: "UnknownMethodError", message: "Unknown method" },
                null
              );
            }
        }
      } catch (error) {
        console.error("Error handling request:", error);
        res(
          {
            name: "RequestHandlingError",
            message: error.message || "Error handling request",
          },
          null
        );
      }
    },

    async onSettingsChange({ key, newValue, oldValue }) {
      console.debug("Settings changed:", { key, newValue, oldValue });

      if (key === "triggerFullSync") {
        this.call({ method: "sync.triggerFullSync" });
      }

      if (
        newValue &&
        newValue !== oldValue &&
        SYNC_SETTINGS_LIST.includes(key)
      ) {
        console.debug(`Syncing setting change for key: ${key}`);
        syncManager.addToPendingPull(key);
        this.triggerPull([key]);
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

    triggerPull(keys) {
      const pullKeys = keys || syncManager.getPendingPull();
      if (!pullKeys || pullKeys.length === 0) {
        console.log("No pending pull keys to trigger.");
        return;
      }
      console.log("Triggering pull with keys:", pullKeys);
      this.call({ method: "pull.trigger", keys: pullKeys });
    },
  })
);
