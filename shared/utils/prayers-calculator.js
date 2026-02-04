import {
    CalculationMethod,
    Coordinates,
    HighLatitudeRule,
    PrayerTimes,
    SunnahTimes,
} from "adhan";

/**
 * Core prayer times engine using the adhan package.
 */
export class PrayersCalculator {
    /**
     * Calculate prayer times for a specific date.
     * @param {Date} date - The date to calculate for
     * @param {{ latitude: number, longitude: number }} location - Coordinates
     * @param {string} methodId - Calculation method key from CALCULATION_METHODS
     * @returns {Object} Timings object with all 8 prayer times as timestamps (ms)
     */
    static calculate(date, location, methodId) {
        const coordinates = new Coordinates(location.latitude, location.longitude);
        const params = this.getCalculationParams(methodId, coordinates);

        const prayerTimes = new PrayerTimes(coordinates, date, params);
        const sunnahTimes = new SunnahTimes(prayerTimes);

        return {
            fajr: prayerTimes.fajr.getTime(),
            sunrise: prayerTimes.sunrise.getTime(),
            dhuhr: prayerTimes.dhuhr.getTime(),
            asr: prayerTimes.asr.getTime(),
            maghrib: prayerTimes.maghrib.getTime(),
            isha: prayerTimes.isha.getTime(),
            midnight: sunnahTimes.middleOfTheNight.getTime(),
            lastthird: sunnahTimes.lastThirdOfTheNight.getTime(),
        };
    }

    /**
     * Get CalculationParameters for a given method key.
     * @param {string} methodId - Method key (e.g., "MuslimWorldLeague")
     * @param {Coordinates} coordinates - Location coordinates for high latitude rule
     * @returns {CalculationParameters} The calculation parameters
     */
    static getCalculationParams(methodId, coordinates) {
        const methodFactory = CalculationMethod[methodId];
        let params;

        if (typeof methodFactory === "function") {
            params = methodFactory();
        } else {
            console.warn(
                `Unknown calculation method: ${methodId}, falling back to MuslimWorldLeague`
            );
            params = CalculationMethod.MuslimWorldLeague();
        }

        params.highLatitudeRule = HighLatitudeRule.recommended(coordinates);
        return params;
    }
}
