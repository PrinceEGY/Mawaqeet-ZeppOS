import { gettext } from "i18n";
import { locationSettingsPage } from "./pages/location/index";
import { notificationSettingsPage } from "./pages/notification/index";
import { viewSettingsPage } from "./pages/view/index";
import { calculationSettingsPage } from "./pages/calculation/index";
import { GeoService } from "../shared/geo_data.js";
import { DEFAULT_LOCATION } from "./utils/constants.js";
import { MenuButton } from "./utils/menu_button.js";
import { Spacer } from "./utils/spacer.js";

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

  renderMainMenu(props) {
    // Get current location
    const currentLocation = props.settingsStorage.getItem("selectedLocation")
      ? JSON.parse(props.settingsStorage.getItem("selectedLocation"))
      : null;

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

    return Section(
      {
        style: {
          color: "white",
          backgroundColor: "black",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          overflowY: "auto",
          overflowX: "auto",
        },
      },
      [
        // Title bar section
        View(
          {
            style: {
              padding: "16px",
              backgroundColor: "#202020",
              width: "100%",
              margin: 0,
            },
          },
          [
            Text(
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "bold",
                },
              },
              gettext("prayer_times_settings")
            ),
          ]
        ),

        Spacer({ height: "16px" }),

        // Main menu list with navigation options
        View(
          {
            style: {
              padding: "0 16px",
              backgroundColor: "#202020",
            },
          },
          menuItems.map((item) =>
            MenuButton({
              label: item.label,
              onClick: () => this.navigateTo(item.page, props),
            })
          )
        ),
      ]
    );
  },
});
