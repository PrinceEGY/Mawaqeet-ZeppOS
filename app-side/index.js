import { BaseSideService } from "@zeppos/zml/base-side";
import { SYNC_SETTINGS_LIST } from "../shared/constants";
import { GeoService } from "../shared/utils/geo-service";
import { StorageService } from "../shared/utils/storage-service";
import { SyncManager } from "./sync-manager";

const syncManager = new SyncManager();
let storageService;

function initializeServices() {
  if (!storageService) {
    storageService = new StorageService(settings.settingsStorage);
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
    },

    onDestroy() { },

    async onRequest(req, res) {
      try {
        switch (req.method) {
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
