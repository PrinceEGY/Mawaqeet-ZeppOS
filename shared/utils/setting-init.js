import { DEFAULT_SETTINGS } from "../constants.js";


export class SettingInitializer {
  static isInitializing = false;
  static _initDoneThisSession = false;

  static resetSessionFlag() {
    this._initDoneThisSession = false;
  }

  static initDefaultSettings(storageService) {
    if (this.isInitializing || this._initDoneThisSession) return;

    if (storageService.getItem("__app_initialized__")) {
      this._initDoneThisSession = true;
      return;
    }

    this.isInitializing = true;

    try {
      this.initNavState(storageService);
      this.initLocationSettings(storageService);
      this.initPrayerSettings(storageService);
      this.initCalculationMethod(storageService);
      this.initSleepSettings(storageService);

      storageService.setItem("__app_initialized__", true);
      this._initDoneThisSession = true;

    } catch (error) {
      // FIX: device side doesn't support console logging
      // console.error("Error during settings initialization:", error);
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
      storageService.setItem("currentLocation", DEFAULT_SETTINGS.location);
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

      const soundKey = `sound:${prayer}`;
      const soundValue = storageService.getItem(soundKey);
      if (soundValue === undefined || soundValue === null) {
        storageService.setItem(soundKey, DEFAULT_SETTINGS.sound[prayer]);
      }
    });
  }

  static initCalculationMethod(storageService) {
    if (!storageService.getItem("calculationMethod")) {
      storageService.setItem(
        "calculationMethod",
        DEFAULT_SETTINGS.calculationMethod
      );
    }
  }
  static initSleepSettings(storageService) {
    const allowAlarmOnSleep = storageService.getItem("allowAlarmOnSleep");
    if (allowAlarmOnSleep === undefined || allowAlarmOnSleep === null) {
      storageService.setItem("allowAlarmOnSleep", DEFAULT_SETTINGS.allowAlarmOnSleep);
    }
  }
}
