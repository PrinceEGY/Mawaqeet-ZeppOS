import { gettext } from "i18n";
import {
  DEFAULT_LOCATION,
  TWO_YEARS_AFTER,
  TWO_YEARS_BEFORE,
} from "../shared/constants.js";
import { GeoService } from "../shared/geo-service.js";
import { fetchExtendedPrayerTimes, getTimeAgo } from "../shared/helpers.js";
import { AppBar } from "./components/app_bar.js";
import { MenuButton } from "./components/menu_button.js";
import { Panel } from "./components/panel.js";
import { Spacer } from "./components/spacer.js";
import { calculationSettingsPage } from "./pages/calculation/index";
import { locationSettingsPage } from "./pages/location/index";
import { notificationSettingsPage } from "./pages/notification/index";
import { viewSettingsPage } from "./pages/view/index";
import {
  BUTTON_STYLES,
  LAYOUT_STYLES,
  SPACING,
  TEXT_STYLES,
} from "./utils/styles.js";

AppSettingsPage({
  onInit() {
    console.log("Settings page initialized");
  },

  getNavState(props) {
    return props.settingsStorage.getItem("navState")
      ? JSON.parse(props.settingsStorage.getItem("navState"))
      : { currentPage: "main", history: [] };
  },

  saveNavState(props, navState) {
    props.settingsStorage.setItem("navState", JSON.stringify(navState));
  },

  initializeDefaultLocation(props) {
    if (!props.settingsStorage.getItem("currentLocation")) {
      const defaultLocation = GeoService.getCityByName(DEFAULT_LOCATION.city);

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
        console.log(`Default location set to ${DEFAULT_LOCATION.city}`);
      } else {
        console.log(
          `Default location (${DEFAULT_LOCATION.city}) not found in GEO_DATA`
        );
      }
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

    fetchExtendedPrayerTimes({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      startDate: TWO_YEARS_BEFORE,
      endDate: TWO_YEARS_AFTER,
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
    this.initializeDefaultLocation(props);

    const navState = this.getNavState(props);

    // Render the appropriate page based on the navigation state
    const pages = {
      location: () =>
        locationSettingsPage(() => this.navigateBack(props), props),
      notification: () =>
        notificationSettingsPage(() => this.navigateBack(props), props),
      view: () => viewSettingsPage(() => this.navigateBack(props)),
      calculation: () =>
        calculationSettingsPage(() => this.navigateBack(props)),
      main: () => this.renderMainMenu(props),
    };

    // Use the page renderer function or default to main menu
    return (pages[navState.currentPage] || pages.main)();
  },

  // Create location information panel
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

  // Create update information panel
  createUpdatePanel(lastUpdateText, props) {
    return [
      // Separator line
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
      // Add explanatory text about update process
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

    // Define menu items for cleaner rendering
    const menuItems = [
      {
        label: gettext("location_settings"),
        page: "location",
      },
      {
        label: gettext("notification_settings"),
        page: "notification",
      },
      {
        label: gettext("view_options"),
        page: "view",
      },
      {
        label: gettext("calculation_method"),
        page: "calculation",
      },
    ];

    return Section({ style: LAYOUT_STYLES.mainContainer }, [
      // Title bar section
      AppBar({
        title: gettext("prayer_times_settings"),
        showBackButton: false,
      }),

      Spacer({ height: SPACING.sm }),

      // Panel showing current location and last update time
      Panel({
        children: [
          ...this.createLocationPanel(currentLocation),
          ...this.createUpdatePanel(lastUpdateText, props),
        ],
      }),

      Spacer({ height: SPACING.sm }),

      // Panel for menu items
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
