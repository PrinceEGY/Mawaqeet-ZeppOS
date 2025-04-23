import { gettext } from "i18n";
import { locationSettingsPage } from "./pages/location/index";
import { notificationSettingsPage } from "./pages/notification/index";
import { viewSettingsPage } from "./pages/view/index";
import { calculationSettingsPage } from "./pages/calculation/index";
import { GeoService } from "../shared/geo_data.js";
import { DEFAULT_LOCATION } from "./utils/constants.js";
import { MenuButton } from "./components/menu_button.js";
import { Spacer } from "./components/spacer.js";
import { Theme } from "./utils/theme.js";
import { AppBar } from "./components/app_bar.js";
import { Panel } from "./components/panel.js";
import {
  TEXT_STYLES,
  BUTTON_STYLES,
  LAYOUT_STYLES,
  SPACING,
} from "./utils/styles.js";
import { getTimeAgo } from "./utils/helpers.js";

AppSettingsPage({
  onInit() {
    console.log("Settings page initialized");
  },

  // Helper functions for state management
  getNavState(props) {
    return props.settingsStorage.getItem("navState")
      ? JSON.parse(props.settingsStorage.getItem("navState"))
      : { currentPage: "main", history: [] };
  },

  saveNavState(props, navState) {
    props.settingsStorage.setItem("navState", JSON.stringify(navState));
  },

  initializeDefaultLocation(props) {
    if (!props.settingsStorage.getItem("selectedLocation")) {
      const defaultLocation = GeoService.getCityByName(DEFAULT_LOCATION.city);

      if (defaultLocation) {
        props.settingsStorage.setItem(
          "selectedLocation",
          JSON.stringify({
            country: defaultLocation.country,
            city: defaultLocation.city,
            latitude: defaultLocation.lat,
            longitude: defaultLocation.lng,
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

  // Navigation helper methods
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

  // Handle manual update action
  handleManualUpdate(props) {
    console.log("Manual update triggered");

    // Set the current timestamp
    const currentTime = new Date().getTime();
    props.settingsStorage.setItem(
      "lastPrayerTimesUpdate",
      currentTime.toString()
    );

    // Additional logic for updating prayer times can be added here
  },

  build(props) {
    // Initialize defaults if needed
    this.initializeDefaultLocation(props);

    // Get the current navigation state
    const navState = this.getNavState(props);

    // Render the appropriate page based on the navigation state
    const pages = {
      location: () =>
        locationSettingsPage(() => this.navigateBack(props), props),
      notification: () =>
        notificationSettingsPage(() => this.navigateBack(props)),
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
        onClick: () => this.handleManualUpdate(props),
      }),
    ];
  },

  renderMainMenu(props) {
    // Get current location
    const currentLocation = props.settingsStorage.getItem("selectedLocation")
      ? JSON.parse(props.settingsStorage.getItem("selectedLocation"))
      : null;

    // Get last update time
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
