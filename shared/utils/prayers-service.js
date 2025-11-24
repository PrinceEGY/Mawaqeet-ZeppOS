import { DateUtils } from "./date-utils";
import { PrayersApi } from "./prayers-api";

export class PrayersService {
  constructor(storageService) {
    this.storageService = storageService;
  }

  async fetchAndSavePrayerTimes({
    location = null,
    calculationMethodId = null,
    monthsBefore = null,
    monthsAfter = null,
  } = {}) {
    location = location || this.storageService.getItem("currentLocation");
    calculationMethodId =
      calculationMethodId ||
      this.storageService.getItem("calculationMethod")?.id;

    const fetchMetaData = this.storageService.getItem("fetchMetaData");
    monthsBefore = monthsBefore ?? fetchMetaData?.beforeMonths;
    monthsAfter = monthsAfter ?? fetchMetaData?.afterMonths;

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

      this.storageService.setItem("prayerTimes", prayerTimesData);

      const updatedFetchMetaData = {
        beforeMonths: monthsBefore,
        afterMonths: monthsAfter,
        autoFetchInterval: fetchMetaData.autoFetchInterval,
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
        fetchDate: Date.now(),
      };

      this.storageService.setItem("fetchMetaData", updatedFetchMetaData);
      console.log("Successfully fetched and saved prayer times.");
    } catch (error) {
      if (error.message.includes("debounce")) {
        console.debug(
          "Debounce error while fetching prayer times.",
          error.message
        );
        return;
      }

      console.error("Error fetching and saving prayer times:", error);
      throw error;
    }
  }

  async fetchAndSaveCalculationMethodsList() {
    try {
      const calculationMethods = await PrayersApi.fetchCalculationMethods();
      this.storageService.setItem("calculationMethodsList", calculationMethods);
      console.log("Successfully fetched and saved calculation methods list.");
    } catch (error) {
      if (error.message.includes("debounce")) {
        console.debug(
          "Debounce error while fetching calculation methods list.",
          error.message
        );
        return;
      }

      console.error(
        "Error fetching and saving calculation methods list:",
        error
      );
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

  updateOutdatedItems() {
    if (this.isPrayerTimesOutdated()) {
      this.fetchAndSavePrayerTimes();
    }

    if (this.isCalculationMethodsListOutdated()) {
      this.fetchAndSaveCalculationMethodsList();
    }
  }

  isPrayerTimesOutdated() {
    const fetchMetaData = this.storageService.getItem("fetchMetaData");

    const autoFetchInterval = fetchMetaData.autoFetchInterval;
    const msPerDay = 24 * 60 * 60 * 1000;
    if (
      this.storageService.isKeyOutdated(
        "prayerTimes",
        autoFetchInterval * msPerDay
      )
    ) {
      console.debug("Prayer times are outdated, needs refresh.");
      return true;
    }
    console.debug("Prayer times are up-to-date.");
    return false;
  }

  isCalculationMethodsListOutdated() {
    const fetchMetaData = this.storageService.getItem("fetchMetaData");
    const autoFetchInterval = fetchMetaData.autoFetchInterval;
    const msPerDay = 24 * 60 * 60 * 1000;
    if (
      this.storageService.isKeyOutdated(
        "calculationMethodsList",
        autoFetchInterval * msPerDay
      )
    ) {
      console.log("Calculation methods list is outdated, needs refresh.");
      return true;
    }
    console.log("Calculation methods list is up-to-date.");
    return false;
  }
}
