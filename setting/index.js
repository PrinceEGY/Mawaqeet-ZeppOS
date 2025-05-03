import { gettext } from "i18n";
import { AppBar } from "./components/app_bar.js";
import { MenuButton } from "./components/menu_button.js";
import { Panel } from "./components/panel.js";
import { Spacer } from "./components/spacer.js";
import { aboutPage } from "./pages/about/index";
import { advancedSettingsPage } from "./pages/advanced/index";
import { calculationSettingsPage } from "./pages/calculation/index";
import { locationSettingsPage } from "./pages/location/index";
import { prayersSettingsPage } from "./pages/prayers/index";
import { SettingInitializer } from "./utils/setting-init.js";
import { LAYOUT_STYLES, SPACING, TEXT_STYLES } from "./utils/styles.js";

AppSettingsPage({
  build(props) {
    SettingInitializer.initDefaultSettings(props);

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

    const renderPage = pages[navState.currentPage] || pages.main;
    return renderPage();
  },

  // --- Helper Methods ---
  getNavState(props) {
    const navState = props.settingsStorage.getItem("navState");
    return navState
      ? JSON.parse(navState)
      : { currentPage: "main", history: [] };
  },

  saveNavState(props, navState) {
    props.settingsStorage.setItem("navState", JSON.stringify(navState));
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

  // --- Build Methods ---
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
        { style: { ...TEXT_STYLES.normal } },
        currentLocation
          ? `${currentLocation.country}, ${currentLocation.city}`
          : gettext("no_location_selected")
      ),
      currentLocation
        ? Text(
            { style: { ...TEXT_STYLES.small, marginTop: SPACING.sm } },
            gettext("latitude") +
              `: ${currentLocation.latitude}°, ` +
              gettext("longitude") +
              `: ${currentLocation.longitude}°`
          )
        : null,
    ];
  },

  renderMainMenu(props) {
    const currentLocation = JSON.parse(
      props.settingsStorage.getItem("currentLocation")
    );

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

      Spacer({ height: SPACING.xs }),

      Panel({
        children: [...this.createLocationPanel(currentLocation)],
      }),

      Spacer({ height: SPACING.xs }),

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
