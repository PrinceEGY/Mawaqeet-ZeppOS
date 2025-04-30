import { DEFAULT_SETTINGS } from "../../shared/constants.js";
import { GeoService } from "../../shared/geo-service.js";
import {
  fetchCalculationMethods,
  parseCalculationMethods,
} from "../../shared/helpers.js";

export const SettingInitializer = {
  initDefaultSettings(props) {
    this.initCalculationMethod(props);
    this.initLocationSettings(props);
    this.initPrayerSettings(props);
    this.initFetchingSettings(props);
  },

  initLocationSettings(props) {
    if (!props.settingsStorage.getItem("currentLocation")) {
      const defaultLocation = GeoService.getCityByName(
        DEFAULT_SETTINGS.location.city
      );

      if (defaultLocation) {
        props.settingsStorage.setItem(
          "currentLocation",
          JSON.stringify({
            country: defaultLocation.country,
            city: defaultLocation.city,
            latitude: defaultLocation.latitude,
            longitude: defaultLocation.longitude,
          })
        );
        console.log(
          `Default location set to ${DEFAULT_SETTINGS.location.city}`
        );
      } else {
        console.log(
          `Default location (${DEFAULT_SETTINGS.location.city}) not found in GEO_DATA`
        );
      }
    }
  },

  initPrayerSettings(props) {
    Object.keys(DEFAULT_SETTINGS.display).forEach((prayer) => {
      const displayKey = `display_${prayer}`;
      if (!props.settingsStorage.getItem(displayKey)) {
        props.settingsStorage.setItem(
          displayKey,
          DEFAULT_SETTINGS.display[prayer].toString()
        );
      }

      const notifyKey = `notify_${prayer}`;
      if (!props.settingsStorage.getItem(notifyKey)) {
        props.settingsStorage.setItem(
          notifyKey,
          DEFAULT_SETTINGS.display[prayer].toString()
        );
      }
    });
  },

  initCalculationMethod(props) {
    if (!props.settingsStorage.getItem("calculationMethod")) {
      props.settingsStorage.setItem(
        "calculationMethod",
        JSON.stringify(DEFAULT_SETTINGS.calculationMethod)
      );
      console.log(
        `Default calculation method set to ${JSON.stringify(
          DEFAULT_SETTINGS.calculationMethod
        )}`
      );
    }

    if (!props.settingsStorage.getItem("calculationMethodsList")) {
      fetchCalculationMethods().then(async (methods) => {
        const parsedMethods = await parseCalculationMethods(methods);
        props.settingsStorage.setItem(
          "calculationMethodsList",
          JSON.stringify(parsedMethods)
        );
      });
    }
  },

  initFetchingSettings(props) {
    if (!props.settingsStorage.getItem("fetchingMonthsBefore")) {
      props.settingsStorage.setItem(
        "fetchingMonthsBefore",
        DEFAULT_SETTINGS.fetching.monthsBefore.toString()
      );
      console.log(
        `Default fetchingMonthsBefore set to ${DEFAULT_SETTINGS.fetching.monthsBefore}`
      );
    }

    if (!props.settingsStorage.getItem("fetchingMonthsAfter")) {
      props.settingsStorage.setItem(
        "fetchingMonthsAfter",
        DEFAULT_SETTINGS.fetching.monthsAfter.toString()
      );
      console.log(
        `Default fetchingMonthsAfter set to ${DEFAULT_SETTINGS.fetching.monthsAfter}`
      );
    }

    if (!props.settingsStorage.getItem("autoFetchDays")) {
      props.settingsStorage.setItem(
        "autoFetchDays",
        DEFAULT_SETTINGS.fetching.automaticFetchInterval.toString()
      );
      console.log(
        `Default autoFetchDays set to ${DEFAULT_SETTINGS.fetching.automaticFetchInterval}`
      );
    }
  },
};
