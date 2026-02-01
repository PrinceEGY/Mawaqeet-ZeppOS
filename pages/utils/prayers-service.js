import { DateUtils } from "../../shared/utils/date-utils";
import { TIMINGS_LIST } from "../../shared/constants";
import { DeviceLogger } from "./device-logger";
import { StorageService } from "./storage-service";

const logger = new DeviceLogger("prayers-service");

let storage = null;

function getStorage() {
  if (!storage) {
    storage = new StorageService("file", "prayer-times");
  }
  return storage;
}

export class PrayersService {
  static getDayPrayerTimes(date = new Date()) {
    const parsedDate = this._parseDate(date);
    if (!parsedDate) return null;

    const key = DateUtils.dateToDateString(parsedDate);
    const timings = getStorage().getItem(key);
    
    if (timings === null || timings === undefined) {
      logger.error(`No prayer times found for date: ${key}`);
      return null;
    }

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

    if (yesterdayPrayerTimes?.timings) {
      for (const [prayer, timestamp] of Object.entries(
        yesterdayPrayerTimes.timings
      )) {
        const yesterdayPrayerTime = new Date(timestamp);
        if (yesterdayPrayerTime > now) {
          effectiveTimings[prayer] = timestamp;
        }
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
        getStorage().setItem(item.date, item.timings, {
          timestamp: Date.now(),
          markForPush,
        });
      });

      logger.debug(
        `${getStorage().getAllKeys().length
        } prayer times saved in local storage.`
      );
      logger.info("Prayer times data set in local storage.");
      return true;
    } catch (error) {
      logger.error(`Error setting prayer times in local storage: ${error}`);
      return false;
    }
  }

  static clear() {
    getStorage().clear();
  }

  static hasPrayerTimesData() {
    const keys = getStorage().getAllKeys();
    return keys && keys.length > 0;
  }

  static getAvailableDateRange() {
    const keys = getStorage().getAllKeys();
    if (!keys || keys.length === 0) {
      return null;
    }

    let minDate = null;
    let maxDate = null;

    keys.forEach((key) => {
      const date = DateUtils.dateStringToDate(key);
      if (!date || isNaN(date.getTime())) {
        return;
      }

      if (!minDate || date < minDate) {
        minDate = date;
      }
      if (!maxDate || date > maxDate) {
        maxDate = date;
      }
    });

    if (!minDate || !maxDate) {
      return null;
    }

    return {
      startDate: minDate,
      endDate: maxDate,
    };
  }

  static getEffectiveAvailableDateRange() {
    const range = this.getAvailableDateRange();
    if (!range) return null;

    const effectiveStart = new Date(range.startDate);
    effectiveStart.setDate(effectiveStart.getDate() + 1);

    if (effectiveStart > range.endDate) {
      return null;
    }

    return {
      startDate: effectiveStart,
      endDate: range.endDate,
    };
  }

  static isDateInValidRange(date) {
    const range = this.getEffectiveAvailableDateRange();
    if (!range) return false;

    const targetDate = this._parseDate(date);
    if (!targetDate) return false;

    const target = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    return target >= range.startDate && target <= range.endDate;
  }

  static isPrayerTimesExpired(currentDate = new Date()) {
    if (!this.hasPrayerTimesData()) {
      return true;
    }

    const today = DateUtils.dateToDateString(currentDate);
    const keys = getStorage().getAllKeys();

    return !keys.includes(today);
  }

  static destroy() {
    storage?.destroy();
    storage = null;
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
  static getNotifyEnabledPrayers(storage) {
    return TIMINGS_LIST.filter(
      (t) => storage.getItem(`notify:${t.name}`) !== false
    ).map((t) => t.name);
  }

  static getDisplayEnabledPrayers(storage) {
    return TIMINGS_LIST.filter(
      (t) => storage.getItem(`display:${t.name}`) !== false
    ).map((t) => t.name);
  }
}
