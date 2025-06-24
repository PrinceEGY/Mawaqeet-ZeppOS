import { log as Logger } from "@zos/utils";
import { DateUtils } from "../../shared/utils/date-utils";
import { StorageService } from "./storage-service";

const logger = Logger.getLogger("prayers-service");

const storage = new StorageService("file", "prayer-times");

export class PrayersService {
  static getDayPrayerTimes(date = new Date()) {
    parsedDate = this._parseDate(date);
    if (!parsedDate) return null;

    const key = DateUtils.dateToDateString(parsedDate);
    if (!storage.hasItem(key)) {
      logger.error(`No prayer times found for date: ${key}`);
      return null;
    }
    const timings = storage.getItem(key);
    logger.debug(`Prayer times for ${key}: ${JSON.stringify(timings)}`);

    return {
      date: parsedDate,
      timings: timings,
    };
  }

  static savePrayerTimes(dataString) {
    this.clear();

    try {
      logger.debug(
        `Setting prayer times in local storage with length: ${dataString.length} bytes`
      );
      const data = JSON.parse(dataString);

      data.forEach((item) => {
        storage.setItem(item.date, item.timings);
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
