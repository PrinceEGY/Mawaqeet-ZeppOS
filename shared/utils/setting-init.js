import { DEFAULT_SETTINGS } from "../constants.js";
import { GeoService } from "./geo-service.js";

export class SettingInitializer {
  static isInitializing = false;
  static _initDoneThisSession = false;

  static resetSessionFlag() {
    this._initDoneThisSession = false;
  }

  static async initDefaultSettings(props) {
    if (this.isInitializing || this._initDoneThisSession) return;

    this.isInitializing = true;

    try {
      props.storageService.setItem("navState", {
        currentPage: "main",
        history: [],
      });
      this.initLocationSettings(props);
      this.initFetchingSettings(props);
      this.initPrayerSettings(props);
      this.initCalculationMethod(props);
      this._initDoneThisSession = true;
    } catch (error) {
      console.error("Error during settings initialization:", error);
    } finally {
      this.isInitializing = false;
    }
  }

  static initLocationSettings(props) {
    if (!props.storageService.getItem("currentLocation")) {
      const defaultLocation = GeoService.getCityByName(
        DEFAULT_SETTINGS.location.city
      );

      if (defaultLocation) {
        props.storageService.setItem("currentLocation", {
          country: defaultLocation.country,
          city: defaultLocation.city,
          latitude: defaultLocation.latitude,
          longitude: defaultLocation.longitude,
        });
        console.debug(
          `Default location set to ${DEFAULT_SETTINGS.location.city}`
        );
      } else {
        console.debug(
          `Default location (${DEFAULT_SETTINGS.location.city}) not found in GEO_DATA`
        );
      }
    }
  }

  static initPrayerSettings(props) {
    Object.keys(DEFAULT_SETTINGS.display).forEach((prayer) => {
      const displayKey = `display:${prayer}`;
      const displayValue = props.storageService.getItem(displayKey);
      if (displayValue === undefined || displayValue === null) {
        props.storageService.setItem(
          displayKey,
          DEFAULT_SETTINGS.display[prayer]
        );
      }

      const notifyKey = `notify:${prayer}`;
      const notifyValue = props.storageService.getItem(notifyKey);
      if (notifyValue === undefined || notifyValue === null) {
        props.storageService.setItem(
          notifyKey,
          DEFAULT_SETTINGS.notify[prayer]
        );
      }
    });
  }

  static initCalculationMethod(props) {
    if (!props.storageService.getItem("calculationMethod")) {
      props.storageService.setItem(
        "calculationMethod",
        DEFAULT_SETTINGS.calculationMethod
      );
      console.debug(
        `Default calculation method set to ${JSON.stringify(
          DEFAULT_SETTINGS.calculationMethod
        )}`
      );
    }
  }

  static initFetchingSettings(props) {
    if (!props.storageService.getItem("fetchingMonthsBefore")) {
      props.storageService.setItem(
        "fetchingMonthsBefore",
        DEFAULT_SETTINGS.fetching.monthsBefore
      );
      console.debug(
        `Default fetchingMonthsBefore set to ${DEFAULT_SETTINGS.fetching.monthsBefore}`
      );
    }

    if (!props.storageService.getItem("fetchingMonthsAfter")) {
      props.storageService.setItem(
        "fetchingMonthsAfter",
        DEFAULT_SETTINGS.fetching.monthsAfter
      );
      console.debug(
        `Default fetchingMonthsAfter set to ${DEFAULT_SETTINGS.fetching.monthsAfter}`
      );
    }

    if (!props.storageService.getItem("autoFetchDays")) {
      props.storageService.setItem(
        "autoFetchDays",
        DEFAULT_SETTINGS.fetching.automaticFetchInterval
      );
      console.debug(
        `Default autoFetchDays set to ${DEFAULT_SETTINGS.fetching.automaticFetchInterval}`
      );
    }
  }
}
