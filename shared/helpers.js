import { DateUtils } from "./utils/date-utils";
import { PrayersApi } from "./utils/prayers-api";

export async function fetchAndSavePrayerTimes({
  storage,
  location,
  calculationMethodId,
  monthsBefore,
  monthsAfter,
}) {
  function getStorageItem(key) {
    const item = storage.getItem(key);
    if (!item) {
      console.error(`${key} not found in storage`);
      throw new Error(`Missing ${key}`);
    }
    return item;
  }

  const resolvedLocation = location ?? getStorageItem("currentLocation");
  const resolvedCalculationMethodId =
    calculationMethodId ?? getStorageItem("calculationMethod").id;
  const resolvedMonthsBefore =
    monthsBefore ?? getStorageItem("fetchingMonthsBefore");
  const resolvedMonthsAfter =
    monthsAfter ?? getStorageItem("fetchingMonthsAfter");

  const { startDate, endDate } = DateUtils.calculateDateRange(
    resolvedMonthsBefore,
    resolvedMonthsAfter
  );

  try {
    const prayerTimesData = await PrayersApi.fetchPrayerTimes({
      latitude: resolvedLocation.latitude,
      longitude: resolvedLocation.longitude,
      startDate: startDate,
      endDate: endDate,
      calculationMethodId: resolvedCalculationMethodId,
    });

    const currentTime = new Date().getTime();
    storage.setItem("lastPrayerTimesUpdate", currentTime);
    storage.setItem("prayerTimes", prayerTimesData);
    console.log(
      `Successfully fetched and saved prayer times. Last update: ${new Date(
        currentTime
      ).toLocaleString()}`
    );
  } catch (error) {
    console.error("Error fetching and saving prayer times:", error);
    throw error;
  }
}
