import { ALADHAN_CALCULATION_METHODS_URL, ALADHAN_URL } from "../constants.js";

export class PrayersApi {
  static async fetchPrayerTimes({
    latitude,
    longitude,
    startDate,
    endDate,
    iso8601 = true,
    timezoneString,
    calculationMethodId,
    monthsPerChunk = 11,
  }) {
    const requestStartDate = new Date(startDate);
    const requestEndDate = new Date(endDate);

    const chunkPromises = [];
    let chunkStartDate = new Date(requestStartDate);

    while (chunkStartDate < requestEndDate) {
      let chunkEndDate = new Date(chunkStartDate);
      chunkEndDate.setMonth(chunkEndDate.getMonth() + monthsPerChunk);

      if (chunkEndDate > requestEndDate) {
        chunkEndDate = new Date(requestEndDate);
      }

      const chunkStartStr = this._formatDateForApi(chunkStartDate);
      const chunkEndStr = this._formatDateForApi(chunkEndDate);

      console.log(
        `Preparing to fetch prayer times from ${chunkStartStr} to ${chunkEndStr}`
      );

      const methodParam =
        calculationMethodId && calculationMethodId !== -1
          ? calculationMethodId
          : undefined; // Use method only if it's not "auto" (-1)

      const chunkPromise = this._fetchPrayerTimesChunk({
        latitude: latitude,
        longitude: longitude,
        startDate: chunkStartStr,
        endDate: chunkEndStr,
        iso8601: iso8601,
        timezoneString: timezoneString,
        calculationMethodId: methodParam,
      }).then((chunkResponse) => {
        console.log(`Received data for ${chunkStartStr} to ${chunkEndStr}`);
        return this._transformApiResponse(chunkResponse.data);
      });

      chunkPromises.push(chunkPromise);

      chunkStartDate = new Date(chunkEndDate);
      chunkStartDate.setDate(chunkStartDate.getDate() + 1); // add 1 day to avoid overlap
    }

    const chunkResults = await Promise.all(chunkPromises);

    const sortedPrayerTimes = chunkResults.flat().sort((a, b) => {
      const dateA = a.date.split("-").reverse().join("-");
      const dateB = b.date.split("-").reverse().join("-");
      return new Date(dateA) - new Date(dateB);
    });

    return sortedPrayerTimes;
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
    timezoneString,
    calculationMethodId,
  }) {
    let URL = `${ALADHAN_URL}/from/${startDate}/to/${endDate}?latitude=${latitude}&longitude=${longitude}`;

    if (calculationMethodId !== undefined) {
      URL += `&method=${calculationMethodId}`;
    }

    if (timezoneString !== undefined) {
      URL += `&timezonestring=${timezoneString}`;
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
