import { gettext } from "i18n";

export function getTimeAgo(timestamp) {
  if (!timestamp) return null;

  try {
    const now = new Date().getTime();
    const updateTime = parseInt(timestamp);
    const diff = now - updateTime;

    // Convert milliseconds to different time units
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
      return `${days} ${days === 1 ? gettext("day_ago") : gettext("days_ago")}`;
    }
  } catch (error) {
    console.log("Error parsing timestamp:", error);
    return gettext("never_updated");
  }
}
