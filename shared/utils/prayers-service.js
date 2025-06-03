import { DateUtils } from "./date-utils";
import { PrayersApi } from "./prayers-api";

export class PrayersService {
  constructor(storageService) {
    this.storageService = storageService;
  }

  async fetchAndSavePrayerTimes(
    location = null,
    calculationMethodId = null,
    monthsBefore = null,
    monthsAfter = null
  ) {
    location = location || this.storageService.getItem("currentLocation");
    calculationMethodId =
      calculationMethodId ||
      this.storageService.getItem("calculationMethod").id;
    monthsBefore =
      monthsBefore || this.storageService.getItem("fetchingMonthsBefore");
    monthsAfter =
      monthsAfter || this.storageService.getItem("fetchingMonthsAfter");

    const { startDate, endDate } = DateUtils.calculateDateRange(
      monthsBefore,
      monthsAfter
    );

    try {
      const prayerTimesData = await PrayersApi.fetchPrayerTimes({
        latitude: location.latitude,
        longitude: location.longitude,
        startDate,
        endDate,
        calculationMethodId,
      });

      const currentTime = new Date().getTime();
      this.storageService.setItem("lastPrayerTimesUpdate", currentTime);
      this.storageService.setItem("prayerTimes", prayerTimesData);
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

  getPrayerTimes(date = new Date()) {
    const prayerTimes = this.storageService.getItem("prayerTimes");
    if (!prayerTimes) {
      console.warn("No prayer times found in storage.");
      return null;
    }

    const dateString = DateUtils.dateToDateString(date);

    const prayerTimesForDate = prayerTimes.find(
      (day) => day.date === dateString
    );
    if (!prayerTimesForDate) {
      console.warn(`No prayer times found for date: ${dateString}`);
      return null;
    }

    return prayerTimesForDate;
  }

  isPrayerTimesOutdated() {
    const lastUpdate = parseInt(
      this.storageService.getItem("lastPrayerTimesUpdate") || "0"
    );
    const autoFetchDays = parseInt(
      this.storageService.getItem("autoFetchDays")
    );
    const msPerDay = 24 * 60 * 60 * 1000;
    const interval = autoFetchDays * msPerDay;

    return Date.now() - lastUpdate > interval;
  }
}
