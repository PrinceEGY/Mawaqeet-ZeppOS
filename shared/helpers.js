import { gettext } from "i18n";
import { ALADHAN_URL } from "./constants";

export function getTimeAgo(timestamp) {
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
      return `${days} ${days === 1 ? gettext("day_ago") : gettext("days_ago")}`;
    }
  } catch (error) {
    console.error(
      "Error in getTimeAgo: Failed to parse timestamp. Details:",
      error
    );
    return gettext("never_updated");
  }
}

export function transformPrayerTimesData(data) {
  return data.map((dayData) => {
    const timings = {};

    // Extract time portion (HH:MM) from ISO string for each prayer time
    Object.keys(dayData.timings).forEach((prayerName) => {
      const isoTimeString = dayData.timings[prayerName];

      const dateObj = new Date(isoTimeString);
      const hours = String(dateObj.getHours()).padStart(2, "0");
      const minutes = String(dateObj.getMinutes()).padStart(2, "0");
      timings[prayerName] = `${hours}:${minutes}`;
    });

    return {
      date_gr: dayData.date.gregorian.date,
      date_hj: dayData.date.hijri.date,
      timings: timings,
    };
  });
}

export async function fetchPrayerTimes({
  latitude,
  longitude,
  startDate,
  endDate,
  iso8601,
  timezonestring,
  method,
}) {
  let URL = `${ALADHAN_URL}/from/${startDate}/to/${endDate}?latitude=${latitude}&longitude=${longitude}`;

  if (method !== undefined) {
    URL += `&method=${method}`;
  }

  if (timezonestring !== undefined) {
    URL += `&timezonestring=${timezonestring}`;
  }

  if (iso8601 !== undefined) {
    URL += `&iso8601=${iso8601}`;
  }

  const response = await fetch(URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(
      `Fetching Prayer Times Error (Status ${response.status}):`,
      errorData.data
    );
    throw new Error(
      `Fetching Prayer Times (Status ${response.status}): ${errorData.data}`
    );
  }

  const data = await response.json();
  return data;
}

function formatDate(date) {
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

export async function fetchExtendedPrayerTimes({
  latitude,
  longitude,
  startDate,
  endDate,
  iso8601 = true,
  timezonestring,
  method,
  chunkMonths = 11,
}) {
  const fromDate = new Date(startDate);
  const toDate = new Date(endDate);

  const fetchPromises = [];
  let currentStartDate = new Date(fromDate);

  while (currentStartDate < toDate) {
    let chunkEndDate = new Date(currentStartDate);
    chunkEndDate.setMonth(chunkEndDate.getMonth() + chunkMonths);

    if (chunkEndDate > toDate) {
      chunkEndDate = new Date(toDate);
    }

    const chunkStartStr = formatDate(currentStartDate);
    const chunkEndStr = formatDate(chunkEndDate);

    console.log(
      `Preparing to fetch prayer times from ${chunkStartStr} to ${chunkEndStr}`
    );

    const fetchPromise = fetchPrayerTimes({
      latitude: latitude,
      longitude: longitude,
      startDate: chunkStartStr,
      endDate: chunkEndStr,
      iso8601: iso8601,
      timezonestring: timezonestring,
      method: method,
    }).then((chunkData) => {
      console.log(`Received data for ${chunkStartStr} to ${chunkEndStr}`);
      return transformPrayerTimesData(chunkData.data);
    });

    fetchPromises.push(fetchPromise);

    currentStartDate = new Date(chunkEndDate);
    currentStartDate.setDate(currentStartDate.getDate() + 1); // add 1 day to avoid overlap
  }

  const results = await Promise.all(fetchPromises);

  const allResults = results.flat().sort((a, b) => {
    const dateA = a.date_gr.split("-").reverse().join("-");
    const dateB = b.date_gr.split("-").reverse().join("-");
    return new Date(dateA) - new Date(dateB);
  });

  return allResults;
}
