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

  static formatDateForApi(date) {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }
}
