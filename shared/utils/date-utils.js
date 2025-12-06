import { gettext } from "i18n";

export class DateUtils {
  static getTimeAgo(timestamp) {
    if (!timestamp) return null;

    try {
      const now = new Date().getTime();
      const updateTime = parseInt(timestamp);
      const diff = now - updateTime;

      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (minutes < 1) {
        return gettext("just_now");
      } else if (minutes < 60) {
        return `${minutes} ${
          minutes === 1 ? gettext("minute_ago") : gettext("minutes_ago")
        }`;
      } else if (hours < 24) {
        return `${hours} ${
          hours === 1 ? gettext("hour_ago") : gettext("hours_ago")
        }`;
      } else {
        return `${days} ${
          days === 1 ? gettext("day_ago") : gettext("days_ago")
        }`;
      }
    } catch (error) {
      console.error(
        "Error in getTimeAgo: Failed to parse timestamp. Details:",
        error
      );
      return gettext("never_updated");
    }
  }

  static calculateDateRange(monthsBefore, monthsAfter) {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - monthsBefore);

    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + monthsAfter);

    return { startDate, endDate };
  }

  /**
   * Converts a Date object to a string in the format "DD{sep}MM{sep}YYYY".
   *
   * @param {Date} date - The date to convert.
   * @param {string} [separator="-"] - The separator to use between date parts.
   * @returns {string} The date string in "DD{sep}MM{sep}YYYY" format.
   */
  static dateToDateString(date, separator = "-") {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}${separator}${month}${separator}${year}`;
  }

  /**
   * Converts a date string in the format "DD-MM-YYYY" to a JavaScript Date object.
   *
   * @param {string} dateString - The date string in "DD-MM-YYYY" format.
   * @returns {Date} The corresponding JavaScript Date object.
   */
  static dateStringToDate(dateString) {
    const parts = dateString.split("-");

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  /**
   * Formats a date and returns separate parts for flexible usage
   *
   * @param {Date} date - The date to format
   * @returns {Object} Object with dayName, monthName, day, ordinal, year properties
   */
  static formatGregorianDate(date = new Date()) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    const ordinal = this.getOrdinalSuffix(day);

    return {
      dayName,
      monthName,
      day,
      ordinal,
      year,
      // Helper methods for common formatting
      getFullDate: () => `${dayName}, ${day}${ordinal} ${monthName}, ${year}`,
      getDayName: () => dayName,
      getDateOnly: () => `${day} ${monthName}, ${year}`,
      getShortDate: () => `${dayName}, ${day}${ordinal} ${monthName}`,
    };
  }

  static getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j == 1 && k != 11) {
      return "st";
    }
    if (j == 2 && k != 12) {
      return "nd";
    }
    if (j == 3 && k != 13) {
      return "rd";
    }
    return "th";
  }

  /**
   * Formats current time in 12-hour format with AM/PM
   *
   * @param {Date} date - The date to get time from (defaults to current time)
   * @param {boolean} includeSeconds - Whether to include seconds in the output (defaults to true)
   * @returns {string} The formatted time string (e.g., "12:12:12 PM" or "12:12 PM")
   */
  static formatCurrentTime(date = new Date(), includeSeconds = true) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    const hoursStr = hours.toString().padStart(2, "0");
    const minutesStr = minutes.toString().padStart(2, "0");

    if (includeSeconds) {
      const secondsStr = seconds.toString().padStart(2, "0");
      return `${hoursStr}:${minutesStr}:${secondsStr} ${period}`;
    } else {
      return `${hoursStr}:${minutesStr} ${period}`;
    }
  }

  static isDateToday(date) {
    const dateString = date.toDateString();
    const now = new Date();
    return dateString === now.toDateString();
  }
}
