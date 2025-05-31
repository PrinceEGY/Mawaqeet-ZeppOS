import { ALADHAN_CALCULATION_METHODS_URL, ALADHAN_URL } from "../constants.js";

export class PrayersApi {
  static async fetchPrayerTimes({
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

      const chunkStartStr = this._formatDateForApi(currentStartDate);
      const chunkEndStr = this._formatDateForApi(chunkEndDate);

      console.log(
        `Preparing to fetch prayer times from ${chunkStartStr} to ${chunkEndStr}`
      );

      const methodParam =
        calculationMethodId && calculationMethodId !== -1
          ? calculationMethodId
          : undefined; // Use method only if it's not "auto" (-1)

      const fetchPromise = this._fetchPrayerTimesChunk({
        latitude: latitude,
        longitude: longitude,
        startDate: chunkStartStr,
        endDate: chunkEndStr,
        iso8601: iso8601,
        timezonestring: timezonestring,
        calculationMethodId: methodParam,
      }).then((chunkData) => {
        console.log(`Received data for ${chunkStartStr} to ${chunkEndStr}`);
        return this._transformApiResponse(chunkData.data);
      });

      fetchPromises.push(fetchPromise);

      currentStartDate = new Date(chunkEndDate);
      currentStartDate.setDate(currentStartDate.getDate() + 1); // add 1 day to avoid overlap
    }

    const results = await Promise.all(fetchPromises);

    const allResults = results.flat().sort((a, b) => {
      const dateA = a.date.split("-").reverse().join("-");
      const dateB = b.date.split("-").reverse().join("-");
      return new Date(dateA) - new Date(dateB);
    });

    return allResults;
  }

  static async fetchCalculationMethods() {
    const response = await fetch(ALADHAN_CALCULATION_METHODS_URL, {
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
    return this._parseCalculationMethods(data);
  }

  static async _fetchPrayerTimesChunk({
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

  static _formatDateForApi(date) {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }

  static _transformApiResponse(data) {
    return data.map((dayData) => {
      const timings = {};

      // Save timings in milliseconds since epoch
      Object.keys(dayData.timings).forEach((prayerName) => {
        const isoTimeString = dayData.timings[prayerName];
        const prayerDate = new Date(isoTimeString);
        timings[prayerName] = prayerDate.getTime();
      });

      const date = dayData.date.gregorian.date;
      let splitDate = date.split("-");
      let formattedDate = `${splitDate[1]}-${splitDate[0]}-${splitDate[2]}`;

      return {
        date: formattedDate,
        timings: timings,
      };
    });
  }

  static _parseCalculationMethods(data) {
    const methods = [];

    // Add "Auto" as the default option
    methods.push({
      id: -1,
      label: "Auto",
      name: "Auto (Recommended)",
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
}
