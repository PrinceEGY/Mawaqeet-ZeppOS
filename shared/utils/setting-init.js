import { DEFAULT_SETTINGS } from "../constants.js";
import { GeoService } from "./geo-service.js";

export class SettingInitializer {
  static isInitializing = false;
  static _initDoneThisSession = false;

  static resetSessionFlag() {
    this._initDoneThisSession = false;
  }

  static initDefaultSettings(storageService) {
    if (this.isInitializing || this._initDoneThisSession) return;

    this.isInitializing = true;

    try {
      this.initNavState(storageService);
      this.initLocationSettings(storageService);
      this.initPrayerSettings(storageService);
      this.initCalculationMethod(storageService);
      this._initDoneThisSession = true;
      console.debug("Default settings initialization completed.");
    } catch (error) {
      console.error("Error during settings initialization:", error);
    } finally {
      this.isInitializing = false;
    }
  }

  static initNavState(storageService) {
    storageService.setItem("navState", {
      currentPage: "main",
      history: [],
    });
  }

  static initLocationSettings(storageService) {
    if (!storageService.getItem("currentLocation")) {
      const defaultLocation = GeoService.getCityByName(
        DEFAULT_SETTINGS.location.city
      );

      if (defaultLocation) {
        storageService.setItem("currentLocation", {
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

  static initPrayerSettings(storageService) {
    Object.keys(DEFAULT_SETTINGS.display).forEach((prayer) => {
      const displayKey = `display:${prayer}`;
      const displayValue = storageService.getItem(displayKey);
      if (displayValue === undefined || displayValue === null) {
        storageService.setItem(displayKey, DEFAULT_SETTINGS.display[prayer]);
      }

      const notifyKey = `notify:${prayer}`;
      const notifyValue = storageService.getItem(notifyKey);
      if (notifyValue === undefined || notifyValue === null) {
        storageService.setItem(notifyKey, DEFAULT_SETTINGS.notify[prayer]);
      }
    });
  }

  static initCalculationMethod(storageService) {
    if (!storageService.getItem("calculationMethod")) {
      storageService.setItem(
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
}
