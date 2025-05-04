import { BaseSideService, settingsLib } from "@zeppos/zml/base-side";
import { SYNC_SETTINGS_LIST } from "../shared/constants";
import { GeoService } from "../shared/geo-service";
import { fetchAndSavePrayerTimes } from "../shared/helpers";
import { SyncManager } from "./sync-manager";

AppSideService(
  BaseSideService({
    onInit() {
      console.log("App side service initialized");
      this.syncManager = new SyncManager({
        request: this.request.bind(this),
      });
    },

    onRun() {
      console.log("App side service running");
      const pendingSync = this.syncManager.getPendingSync();
      if (Object.keys(pendingSync).length > 0) {
        console.log(
          `Pending sync items detected, `,
          pendingSync,
          `attempting sync...`
        );
        setTimeout(() => {
          this.syncManager.syncPendingItems();
        }, 3000);
      } else {
        console.log("No pending sync items.");
      }
    },

    onDestroy() {},

    async onRequest(req, res) {
      try {
        if (req.method === "fetchPrayerTimes") {
          await fetchAndSavePrayerTimes({ storage: settingsLib });
          res(null, { status: "success" });
        } else if (req.method === "getCurrentLocation") {
          const currentLocation = JSON.parse(
            settingsLib.getItem("currentLocation")
          );
          res(null, { location: currentLocation });
        } else if (req.method === "getCityByGeoLocation") {
          const { latitude, longitude } = req.params;
          const closestCity = GeoService.getClosestCity(latitude, longitude);
          res(null, { city: closestCity });
        } else {
          res({ error: "Unknown method" }, null);
        }
      } catch (error) {
        console.error("onRequest error:", error);
        res(error, null);
      }
    },

    async onSettingsChange({ key, newValue, oldValue }) {
      console.log("Settings changed:", { key, newValue, oldValue });

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

      // Sync the setting with the device
      if (
        newValue &&
        newValue !== oldValue &&
        SYNC_SETTINGS_LIST.includes(key)
      ) {
        this.syncManager.addToPendingSync(key, newValue);
        this.syncManager.syncPendingItems();
      }
    },
  })
);
