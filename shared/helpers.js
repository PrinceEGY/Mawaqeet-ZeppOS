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
    const itemStr = storage.getItem(key);
    if (!itemStr) {
      console.error(`${key} not found in storage`);
      throw new Error(`Missing ${key}`);
    }
    try {
      return JSON.parse(itemStr);
    } catch (error) {
      console.error(
        `Failed to parse ${key} from storage. Value: ${itemStr}`,
        error
      );
      throw new Error(`Invalid ${key} format in storage`);
    }
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
    console.log(
      `Fetching prayer times from ${startDate.toLocaleString()} to ${endDate.toLocaleString()}`
    );
    const prayerTimesData = await PrayersApi.fetchPrayerTimes({
      latitude: resolvedLocation.latitude,
      longitude: resolvedLocation.longitude,
      startDate: startDate,
      endDate: endDate,
      calculationMethodId: resolvedCalculationMethodId,
    });

    const currentTime = new Date().getTime();
    storage.setItem("lastPrayerTimesUpdate", currentTime.toString());
    storage.setItem("prayerTimes", JSON.stringify(prayerTimesData));
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
