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
            const resetTrigger = storageService.getItem("triggerAppReset");
            if (resetTrigger) {
              console.debug("Found pending app reset trigger during sync check");
              this.request({ method: "app.reset" })
                .then(() => {
                  console.log("Device reset confirmed. Removing trigger.");
                  storageService.removeItem("triggerAppReset");
                })
                .catch((err) => {
                  console.warn("Reset request failed. Trigger retained.", err);
                });
            }

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
        if (syncManager.getPendingPull().length > 0) {
          this.call({ method: "sync.pending" });
        }
      }

      if (key === "triggerAppReset") {
        console.debug("App side service received reset trigger");
        this.request({ method: "app.reset" })
          .then(() => {
            console.log("Device reset confirmed. Removing trigger.");
            storageService.removeItem("triggerAppReset");
          })
          .catch((err) => {
            console.warn("Reset request failed (device likely offline). Trigger retained for next sync.", err);
          });
        return;
      }

      if (
        newValue &&
        newValue !== oldValue &&
        SYNC_SETTINGS_LIST.includes(key)
      ) {
        try {
          const parsedValue = JSON.parse(newValue);
          if (parsedValue && parsedValue.markForSync === true) {
            console.debug(`Syncing setting change for key: ${key}`);
            syncManager.addToPendingPull(key);
            this.call({ method: "sync.pending" });
          } else {
            console.debug(`Skipping sync for key: ${key} (markForSync not true)`);
          }
        } catch (e) {
          console.warn(`Failed to parse settings value for key: ${key}`, e);
        }
      }
    },


  })
);
