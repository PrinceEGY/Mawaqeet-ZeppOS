import { DateUtils } from "../../shared/utils/date-utils";
import { DeviceLogger } from "./device-logger";
import { StorageService } from "./storage-service";

const logger = new DeviceLogger("prayers-service");

const storage = new StorageService("file", "prayer-times");

export class PrayersService {
  static getDayPrayerTimes(date = new Date()) {
    const parsedDate = this._parseDate(date);
    if (!parsedDate) return null;

    const key = DateUtils.dateToDateString(parsedDate);
    if (!storage.hasItem(key)) {
      logger.error(`No prayer times found for date: ${key}`);
      return null;
    }

    const timings = storage.getItem(key);
    return { date: parsedDate, timings };
  }

  /**
   * Get effective prayer times for a given date, handling cross-midnight scenarios.
   * This method ensures that if a prayer time extends past midnight, it's included
   * in the current day's schedule even if it technically belongs to the previous day.
   *
   * @param {Date} date - The date for which to get effective prayer times
   * @param {Date} now - Current time (default: new Date())
   * @returns {Object} Object containing effective prayer times for the day
   */
  static getEffectiveDayPrayerTimes(date = new Date(), now = new Date()) {
    const targetDate = this._parseDate(date);
    if (!targetDate) return null;

    const todayPrayerTimes = this.getDayPrayerTimes(targetDate);
    if (!todayPrayerTimes) return null;

    const previousDay = new Date(targetDate);
    previousDay.setDate(previousDay.getDate() - 1);
    const yesterdayPrayerTimes = this.getDayPrayerTimes(previousDay);

    const effectiveTimings = { ...todayPrayerTimes.timings };

    for (const [prayer, timestamp] of Object.entries(
      yesterdayPrayerTimes.timings
    )) {
      const yesterdayPrayerTime = new Date(timestamp);
      // Check if yesterday's prayer time extends into today
      if (yesterdayPrayerTime > now) {
        effectiveTimings[prayer] = timestamp;
      }
    }

    const sortedTimings = Object.entries(effectiveTimings).sort(
      ([, timeA], [, timeB]) => new Date(timeA) - new Date(timeB)
    );

    return {
      date: targetDate,
      timings: Object.fromEntries(sortedTimings),
    };
  }

  /**
   * Get the next prayer time using effective prayer times (handles cross-midnight scenarios).
   * This method will find the next upcoming prayer considering both today's and yesterday's
   * prayer times that may extend into today.
   *
   * @param {Date} date - The date to check (default: new Date())
   * @param {Date} now - Current time (default: new Date())
   * @param {Array<string>} enabledPrayers - List of prayer names that are enabled for display (optional)
   * @returns {Object|null} Object with { prayer, time } or null if no upcoming prayer found
   */
  static getNextPrayerTime(
    date = new Date(),
    now = new Date(),
    enabledPrayers = null
  ) {
    const { timings: todayTimings } =
      PrayersService.getEffectiveDayPrayerTimes(date);

    for (const [prayer, time] of Object.entries(todayTimings)) {
      if (enabledPrayers && !enabledPrayers.includes(prayer)) {
        continue;
      }

      const prayerTime = new Date(time);

      if (prayerTime > now) {
        logger.debug(
          `Next prayer time is ${prayer} at ${prayerTime.toLocaleTimeString()}`
        );
        logger.debug(`Current time is ${now.toLocaleTimeString()}`);
        return { prayer, time };
      }
    }
  }

  static savePrayerTimes(dataString, markForPush = false) {
    this.clear();

    try {
      logger.debug(
        `Setting prayer times in local storage with length: ${dataString.length} bytes`
      );
      const data = JSON.parse(dataString);

      data.forEach((item) => {
        storage.setItem(item.date, item.timings, {
          timestamp: Date.now(),
          markForPush,
        });
      });

      logger.debug(
        `${storage.getAllKeys().length} prayer times saved in local storage.`
      );
      logger.info("Prayer times data set in local storage.");
      return true;
    } catch (error) {
      logger.error(`Error setting prayer times in local storage: ${error}`);
      return false;
    }
  }

  static clear() {
    storage.clear();
  }

  static hasPrayerTimesData() {
    const keys = storage.getAllKeys();
    return keys && keys.length > 0;
  }

  static isPrayerTimesExpired(currentDate = new Date()) {
    if (!this.hasPrayerTimesData()) {
      return true;
    }

    const today = DateUtils.dateToDateString(currentDate);
    const keys = storage.getAllKeys();

    return !keys.includes(today);
  }

  static _parseDate(date) {
    try {
      if (typeof date === "string") {
        return new Date(date);
      } else if (date instanceof Date) {
        return date;
      } else if (typeof date === "number") {
        return new Date(date);
      } else {
        logger.error(`Invalid date format: ${date}`);
        return null;
      }
    } catch (error) {
      logger.error(`Error parsing date: ${error}`);
      return null;
    }
  }
}
