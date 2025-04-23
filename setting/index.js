import { gettext } from "i18n";
import { locationSettingsPage } from "./pages/location/index";
import { notificationSettingsPage } from "./pages/notification/index";
import { viewSettingsPage } from "./pages/view/index";
import { calculationSettingsPage } from "./pages/calculation/index";
import { GEO_DATA } from "../shared/geo_data.js";
import { MenuButton } from "./utils/menu_button.js";
import { Spacer } from "./utils/spacer.js";

AppSettingsPage({
  onInit() {
    console.log("Settings page initialized");

    // Initialize location with default (Egypt, Cairo) if not set
    this.initializeDefaultLocation();
  },

  initializeDefaultLocation(props) {
    if (!props.settingsStorage.getItem("selectedLocation")) {
      // Find Egypt/Cairo in GEO_DATA
      const defaultLocation = GEO_DATA.find(
        (item) => item.country === "Egypt" && item.city === "Cairo"
      );

      if (defaultLocation) {
        props.settingsStorage.setItem(
          "selectedLocation",
          JSON.stringify({
            country: "Egypt",
            city: "Cairo",
            latitude: defaultLocation.latitude,
            longitude: defaultLocation.longitude,
          })
        );
        console.log("Default location set to Egypt, Cairo");
      } else {
        console.log("Default location (Egypt, Cairo) not found in GEO_DATA");
      }
    }
  },

  // Navigation helper methods
  navigateTo(page, props) {
    const navState = props.settingsStorage.getItem("navState")
      ? JSON.parse(props.settingsStorage.getItem("navState"))
      : { currentPage: "main", history: [] };

    navState.history.push(navState.currentPage);
    navState.currentPage = page;

    props.settingsStorage.setItem("navState", JSON.stringify(navState));
  },

  navigateBack(props) {
    const navState = props.settingsStorage.getItem("navState")
      ? JSON.parse(props.settingsStorage.getItem("navState"))
      : { currentPage: "main", history: [] };

    if (navState.history.length > 0) {
      navState.currentPage = navState.history.pop();
      props.settingsStorage.setItem("navState", JSON.stringify(navState));
    }
  },

  build(props) {
    // Initialize defaults if needed
    if (!props.settingsStorage.getItem("selectedLocation")) {
      this.initializeDefaultLocation(props);
    }

    // Initialize nav state if it doesn't exist
    if (!props.settingsStorage.getItem("navState")) {
      props.settingsStorage.setItem(
        "navState",
        JSON.stringify({
          currentPage: "main",
          history: [],
        })
      );
    }

    // Get the current navigation state
    const navState = JSON.parse(props.settingsStorage.getItem("navState"));

    // Render the appropriate page based on the navigation state
    switch (navState.currentPage) {
      case "location":
        return locationSettingsPage(() => this.navigateBack(props), props);
      case "notification":
        return notificationSettingsPage(() => this.navigateBack(props));
      case "view":
        return viewSettingsPage(() => this.navigateBack(props));
      case "calculation":
        return calculationSettingsPage(() => this.navigateBack(props));
      default:
        // Main menu
        return this.renderMainMenu(props);
    }
  },

  renderMainMenu(props) {
    // Get current location
    const currentLocation = props.settingsStorage.getItem("selectedLocation")
      ? JSON.parse(props.settingsStorage.getItem("selectedLocation"))
      : null;

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
          [
            // Location settings option
            MenuButton({
              label: gettext("location_settings"),
              onClick: () => this.navigateTo("location", props),
            }),

            // Notification settings option
            MenuButton({
              label: gettext("notification_settings"),
              onClick: () => this.navigateTo("notification", props),
            }),

            // View options
            MenuButton({
              label: gettext("view_options"),
              onClick: () => this.navigateTo("view", props),
            }),

            // Calculation method option
            MenuButton({
              label: gettext("calculation_method"),
              onClick: () => this.navigateTo("calculation", props),
            }),
          ]
        ),
      ]
    );
  },
});
