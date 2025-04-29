import { gettext } from "i18n";
import {
  DEFAULT_SETTINGS,
  TWO_YEARS_AFTER,
  TWO_YEARS_BEFORE,
} from "../shared/constants.js";
import { GeoService } from "../shared/geo-service.js";
import { fetchExtendedPrayerTimes, getTimeAgo } from "../shared/helpers.js";
import { AppBar } from "./components/app_bar.js";
import { MenuButton } from "./components/menu_button.js";
import { Panel } from "./components/panel.js";
import { Spacer } from "./components/spacer.js";
import { aboutPage } from "./pages/about/index";
import { advancedSettingsPage } from "./pages/advanced/index";
import { calculationSettingsPage } from "./pages/calculation/index";
import { locationSettingsPage } from "./pages/location/index";
import { prayersSettingsPage } from "./pages/prayers/index";
import {
  BUTTON_STYLES,
  LAYOUT_STYLES,
  SPACING,
  TEXT_STYLES,
} from "./utils/styles.js";
import {
  fetchCalculationMethods,
  parseCalculationMethods,
} from "../shared/helpers.js";

AppSettingsPage({
  onInit() {
    console.log("Settings page initialized");
  },

  getNavState(props) {
    const navState = props.settingsStorage.getItem("navState");
    return navState
      ? JSON.parse(navState)
      : { currentPage: "main", history: [] };
  },

  saveNavState(props, navState) {
    props.settingsStorage.setItem("navState", JSON.stringify(navState));
  },

  initializeDefaultSettings(props) {
    this.initializeCalculationMethod(props);
    this.initializeLocationSettings(props);
    this.initializePrayerSettings(props);
  },

  initializeLocationSettings(props) {
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

  initializePrayerSettings(props) {
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

  initializeCalculationMethod(props) {
    if (!props.settingsStorage.getItem("calculationMethod")) {
      props.settingsStorage.setItem(
        "calculationMethod",
        JSON.stringify(DEFAULT_SETTINGS.calculationMethod)
      );
      console.log(
        `Default calculation method set to ${DEFAULT_SETTINGS.calculationMethod}`
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

  navigateTo(page, props) {
    const navState = this.getNavState(props);
    navState.history.push(navState.currentPage);
    navState.currentPage = page;
    this.saveNavState(props, navState);
  },

  navigateBack(props) {
    const navState = this.getNavState(props);
    if (navState.history.length > 0) {
      navState.currentPage = navState.history.pop();
      this.saveNavState(props, navState);
    }
  },

  handleManualUpdate(props) {
    const currentLocation = JSON.parse(
      props.settingsStorage.getItem("currentLocation")
    );

    const calculationMethod = JSON.parse(
      props.settingsStorage.getItem("calculationMethod")
    );

    fetchExtendedPrayerTimes({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      startDate: TWO_YEARS_BEFORE,
      endDate: TWO_YEARS_AFTER,
      method: calculationMethod,
    })
      .then((result) => {
        const currentTime = new Date().getTime();
        props.settingsStorage.setItem(
          "lastPrayerTimesUpdate",
          currentTime.toString()
        );
        props.settingsStorage.setItem("prayerTimes", JSON.stringify(result));
      })
      .catch((error) => {
        console.error("Error fetching prayer times:", error);
      });
  },

  build(props) {
    this.initializeDefaultSettings(props);

    const navState = this.getNavState(props);

    // Render the appropriate page based on the navigation state
    const pages = {
      location: () =>
        locationSettingsPage(() => this.navigateBack(props), props),
      prayers: () => prayersSettingsPage(() => this.navigateBack(props), props),
      calculation: () =>
        calculationSettingsPage(() => this.navigateBack(props), props),
      advanced: () =>
        advancedSettingsPage(() => this.navigateBack(props), props),
      about: () => aboutPage(() => this.navigateBack(props), props),
      main: () => this.renderMainMenu(props),
    };

    // Use the page renderer function or default to main menu
    return (pages[navState.currentPage] || pages.main)();
  },

  createLocationPanel(currentLocation) {
    return [
      Text(
        {
          style: {
            ...TEXT_STYLES.heading,
            marginBottom: SPACING.xs,
          },
        },
        gettext("current_location")
      ),
      Text(
        {
          style: {
            ...TEXT_STYLES.normal,
            marginBottom: SPACING.md,
          },
        },
        currentLocation
          ? `${currentLocation.country}, ${currentLocation.city}`
          : gettext("no_location_selected")
      ),
    ];
  },

  createUpdatePanel(lastUpdateText, props) {
    return [
      View({
        style: {
          ...LAYOUT_STYLES.separator,
          marginBottom: SPACING.md,
        },
      }),
      Text(
        {
          style: {
            ...TEXT_STYLES.subheading,
            marginBottom: SPACING.xs,
          },
        },
        gettext("last_update")
      ),
      Text(
        {
          style: {
            ...TEXT_STYLES.normal,
            marginBottom: SPACING.xs,
          },
        },
        lastUpdateText || gettext("never_updated")
      ),
      Text(
        {
          style: {
            ...TEXT_STYLES.small,
            marginBottom: SPACING.md,
          },
        },
        gettext("prayer_update_clarification")
      ),
      // Manual update button
      Button({
        label: gettext("update_now"),
        style: {
          ...BUTTON_STYLES.primary,
          width: "80%",
        },
        onClick: () => {
          this.handleManualUpdate(props);
        },
      }),
    ];
  },

  renderMainMenu(props) {
    const currentLocation = JSON.parse(
      props.settingsStorage.getItem("currentLocation")
    );

    const lastUpdate = props.settingsStorage.getItem("lastPrayerTimesUpdate");
    const lastUpdateText = getTimeAgo(lastUpdate);

    const menuItems = [
      { label: gettext("location_settings"), page: "location" },
      { label: gettext("prayers_settings"), page: "prayers" },
      { label: gettext("calculation_method"), page: "calculation" },
      { label: gettext("advanced_settings"), page: "advanced" },
      { label: gettext("about"), page: "about" },
    ];

    return Section({ style: LAYOUT_STYLES.mainContainer }, [
      AppBar({
        title: gettext("prayer_times_settings"),
        showBackButton: false,
      }),

      Spacer({ height: SPACING.sm }),

      Panel({
        children: [
          ...this.createLocationPanel(currentLocation),
          ...this.createUpdatePanel(lastUpdateText, props),
        ],
      }),

      Spacer({ height: SPACING.sm }),

      Panel({
        children: menuItems.map((item) =>
          MenuButton({
            label: item.label,
            onClick: () => this.navigateTo(item.page, props),
          })
        ),
      }),
    ]);
  },
});
