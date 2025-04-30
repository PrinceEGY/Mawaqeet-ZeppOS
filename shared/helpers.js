import { gettext } from "i18n";
import {
  ALADHAN_URL,
  ALADHAN_METHODS_URL,
  DEFAULT_SETTINGS,
} from "./constants";

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
  calculationMethodId,
}) {
  let URL = `${ALADHAN_URL}/from/${startDate}/to/${endDate}?latitude=${latitude}&longitude=${longitude}`;

  if (calculationMethodId !== undefined) {
    URL += `&method=${calculationMethodId}`;
  }

  if (timezonestring !== undefined) {
    URL += `&timezonestring=${timezonestring}`;
  }

  if (iso8601 !== undefined) {
    URL += `&iso8601=${iso8601}`;
  }

  console.log(`Fetching prayer times from ${URL}`);

  const response = await fetch(URL, {
    method: "GET",
    headers: { Accept: "application/json" },
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
  calculationMethodId,
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

    const methodParam =
      calculationMethodId && calculationMethodId !== -1
        ? calculationMethodId
        : undefined; // Use method only if it's not "auto" (-1)

    const fetchPromise = fetchPrayerTimes({
      latitude: latitude,
      longitude: longitude,
      startDate: chunkStartStr,
      endDate: chunkEndStr,
      iso8601: iso8601,
      timezonestring: timezonestring,
      calculationMethodId: methodParam,
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

export async function fetchCalculationMethods() {
  const response = await fetch(ALADHAN_METHODS_URL, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(
      `Fetching Calculation Methods Error (Status ${response.status}):`,
      errorData.data
    );
    throw new Error(
      `Fetching Calculation Methods (Status ${response.status}): ${errorData.data}`
    );
  }

  const data = await response.json();
  return data;
}

export async function parseCalculationMethods(data) {
  const methods = [];

  // Add "Auto" as the default option
  methods.push({
    id: -1,
    label: "Auto",
    name: gettext("calculation_method_auto"),
    params: {},
  });

  Object.entries(data.data).forEach(([key, method]) => {
    methods.push({
      id: method.id,
      label: key,
      name: method.name,
      params: method.params,
    });
  });

  methods.pop(); // Remove the last method (unwanted custom method)

  return methods;
}

export async function fetchAndSavePrayerTimes({
  storage,
  location,
  calculationMethodId,
  monthsBefore,
  monthsAfter,
}) {
  location = location || JSON.parse(storage.getItem("currentLocation"));
  calculationMethodId =
    calculationMethodId || JSON.parse(storage.getItem("calculationMethod")).id;
  monthsBefore = monthsBefore || storage.getItem("fetchingMonthsBefore");
  monthsAfter = monthsAfter || storage.getItem("fetchingMonthsAfter");

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - parseInt(monthsBefore));

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + parseInt(monthsAfter));

  try {
    const result = await fetchExtendedPrayerTimes({
      latitude: location.latitude,
      longitude: location.longitude,
      startDate: startDate,
      endDate: endDate,
      calculationMethodId: calculationMethodId,
    });

    const currentTime = new Date().getTime();
    storage.setItem("lastPrayerTimesUpdate", currentTime.toString());
    storage.setItem("prayerTimes", JSON.stringify(result));
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    throw error;
  }
}
