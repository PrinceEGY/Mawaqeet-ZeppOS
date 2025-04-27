import { BaseSideService, settingsLib } from "@zeppos/zml/base-side";
import { gettext } from "i18n";
import { fetchExtendedPrayerTimes } from "../shared/helpers";
import { TWO_YEARS_AFTER, TWO_YEARS_BEFORE } from "../shared/constants";

async function fetchAndUpdatePrayerTimes() {
  const currentLocation = JSON.parse(settingsLib.getItem("currentLocation"));
  console.log(currentLocation.latitude, currentLocation.longitude);
  console.log("Fetching prayer times for location:", currentLocation);
  await fetchExtendedPrayerTimes({
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    startDate: TWO_YEARS_BEFORE,
    endDate: TWO_YEARS_AFTER,
  })
    .then((result) => {
      const currentTime = new Date().getTime();
      settingsLib.setItem("lastPrayerTimesUpdate", currentTime.toString());
      settingsLib.setItem("prayerTimes", JSON.stringify(result));
    })
    .catch((error) => {
      console.error("Error fetching prayer times:", error);
    });
}

AppSideService(
  BaseSideService({
    onInit() {
      console.log(gettext("example"));
    },

    async onRequest(req, res) {
      if (req.method === "fetchPrayerTimes") {
        try {
          await fetchAndUpdatePrayerTimes();
          res(null, { status: "success" });
        } catch (error) {
          console.error("Error fetching prayer times:", error);
          res(error, null);
        }
      }
    },

    onRun() {},

    async onSettingsChange({ key, newValue, oldValue }) {
      console.log("Settings changed:", key, newValue, oldValue); // TODO: remove this line in production
      if (key === "currentLocation") {
        await fetchAndUpdatePrayerTimes();
        console.log(`Prayer times updated based on new location :${newValue}.`);
      }
    },

    onDestroy() {},
  })
);
