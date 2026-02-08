import { TIMINGS_LIST } from "../../shared/constants";
import { DateUtils } from "../../shared/utils/date-utils";
import { PrayersCalculator } from "../../shared/utils/prayers-calculator";
import { DeviceLogger } from "./device-logger";
import { StorageService } from "./storage-service";

const logger = new DeviceLogger("prayers-service");

const prayerTimesCache = new Map();

export class PrayersService {
  /**
   * Get prayer times for a specific date.
   * @param {Date} date
   * @returns {{ date: Date, timings: Object<string, string> } | null}
   */
  static getDayPrayerTimes(date = new Date()) {
    const dateKey = DateUtils.dateToDateString(date);

    if (prayerTimesCache.has(dateKey)) {
      return prayerTimesCache.get(dateKey);
    }

    const location = StorageService.getItem("currentLocation");
    const calculationMethod = StorageService.getItem("calculationMethod");

    if (!location?.latitude || !location?.longitude) {
      logger.error("No location configured for prayer calculation");
      return null;
    }

    const methodKey = calculationMethod?.id || "MuslimWorldLeague";

    try {
      const timings = PrayersCalculator.calculate(date, location, methodKey);
      const result = { date, timings };
      prayerTimesCache.set(dateKey, result);
      return result;
    } catch (error) {
      logger.error(`Error calculating prayer times: ${error}`);
      return null;
    }
  }

  /**
   * Get prayer times handling cross-midnight scenarios.
   * If yesterday's Isha extends past midnight, it's included in today's times.
   * @param {Date} date
   * @param {Date} now - Current time for comparison
   * @returns {{ date: Date, timings: Object<string, string> } | null}
   */
  static getEffectiveDayPrayerTimes(date = new Date(), now = new Date()) {
    const todayPrayerTimes = this.getDayPrayerTimes(date);
    if (!todayPrayerTimes) return null;

    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    const yesterdayPrayerTimes = this.getDayPrayerTimes(previousDay);

    const effectiveTimings = { ...todayPrayerTimes.timings };

    if (yesterdayPrayerTimes?.timings) {
      for (const [prayerId, timestamp] of Object.entries(yesterdayPrayerTimes.timings)) {
        const yesterdayPrayerTime = new Date(timestamp);
        if (yesterdayPrayerTime > now) {
          effectiveTimings[prayerId] = timestamp;
        }
      }
    }

    const sortedTimings = Object.entries(effectiveTimings).sort(
      ([, timeA], [, timeB]) => new Date(timeA) - new Date(timeB)
    );

    return {
      date,
      timings: Object.fromEntries(sortedTimings),
    };
  }

  /**
   * Find the next upcoming prayer.
   * @param {Date} date
   * @param {Date} now
   * @param {string[]|null} enabledPrayers - Filter to only these prayers
   * @returns {{ prayerId: string, time: string } | null}
   */
  static getNextPrayerTime(date = new Date(), now = new Date(), enabledPrayers = null) {
    const effectiveTimes = this.getEffectiveDayPrayerTimes(date, now);
    if (!effectiveTimes?.timings) return null;

    for (const [prayerId, time] of Object.entries(effectiveTimes.timings)) {
      if (enabledPrayers && !enabledPrayers.includes(prayerId)) continue;

      if (new Date(time) > now) {
        return { prayerId, time };
      }
    }

    return null;
  }

  /**
   * Get enabled prayers for notifications.
   * @returns {string[]}
   */
  static getNotifyEnabledPrayers() {
    return TIMINGS_LIST.filter(
      (t) => StorageService.getItem(`notify:${t.id}`) !== false
    ).map((t) => t.id);
  }

  /**
   * Get enabled prayers for display.
   * @returns {string[]}
   */
  static getDisplayEnabledPrayers() {
    return TIMINGS_LIST.filter(
      (t) => StorageService.getItem(`display:${t.id}`) !== false
    ).map((t) => t.id);
  }

  static clearCache() {
    prayerTimesCache.clear();
  }


}
