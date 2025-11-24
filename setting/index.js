import { gettext } from "i18n";
import { PrayersService } from "../shared/utils/prayers-service.js";
import { SettingInitializer } from "../shared/utils/setting-init.js";
import { StorageService } from "../shared/utils/storage-service.js";
import { AppBar } from "./components/app_bar.js";
import { MenuButton } from "./components/menu_button.js";
import { Panel } from "./components/panel.js";
import { Spacer } from "./components/spacer.js";
import { aboutPage } from "./pages/about/index";
import { advancedSettingsPage } from "./pages/advanced/index";
import { calculationSettingsPage } from "./pages/calculation/index";
import { locationSettingsPage } from "./pages/location/index";
import { prayersSettingsPage } from "./pages/prayers/index";
import { LAYOUT_STYLES, SPACING, TEXT_STYLES } from "./utils/styles.js";

let storageService = null;
let prayerService = null;

function handleFirstRunInitialization() {
  const isFirstRun = !storageService.hasItem("__app_initialized__");

  if (isFirstRun) {
    console.info("First run detected. Initializing default settings...");
    // Mark as uninitialized to trigger app-side initialization
    // This prevents "rpc error [call] -1 setting storage not existed" on first run
    storageService.setItem("__app_initialized__", false);

    setTimeout(() => {
      SettingInitializer.initDefaultSettings(storageService);
      storageService.setItem("__app_initialized__", true);
    }, 2000);
    setTimeout(() => {
      prayerService.updateOutdatedItems();
    }, 4000);
  } else {
    prayerService.updateOutdatedItems();
  }
}

AppSettingsPage({
  build(props) {
    storageService = new StorageService(props.settingsStorage);
    prayerService = new PrayersService(storageService);
    props.storageService = storageService;
    console.log(props);

    handleFirstRunInitialization();

    const navState = this.getNavState();

    // Render the appropriate page based on the navigation state
    const pages = {
      location: () => locationSettingsPage(() => this.navigateBack(), props),
      prayers: () => prayersSettingsPage(() => this.navigateBack(), props),
      calculation: () =>
        calculationSettingsPage(() => this.navigateBack(), props),
      advanced: () => advancedSettingsPage(() => this.navigateBack(), props),
      about: () => aboutPage(() => this.navigateBack(), props),
      main: () => this.renderMainMenu(),
    };

    const renderPage = pages[navState.currentPage] || pages.main;
    return renderPage();
  },

  renderMainMenu() {
    const currentLocation = storageService.getItem("currentLocation");

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

      this.buildSyncingNotifyPanel(),

      Spacer({ height: SPACING.xs }),

      Panel({
        children: [...this.buildLocationPanel(currentLocation)],
      }),

      Spacer({ height: SPACING.xs }),

      Panel({
        children: menuItems.map((item) =>
          MenuButton({
            label: item.label,
            onClick: () => this.navigateTo(item.page),
          })
        ),
      }),
    ]);
  },

  // --- Helper Methods ---
  getNavState() {
    const navState = storageService.getItem("navState");
    return navState ? navState : { currentPage: "main", history: [] };
  },

  saveNavState(navState) {
    storageService.setItem("navState", navState);
  },

  navigateTo(page) {
    const navState = this.getNavState();
    navState.history.push(navState.currentPage);
    navState.currentPage = page;
    this.saveNavState(navState);
  },

  navigateBack() {
    const navState = this.getNavState();
    if (navState.history.length > 0) {
      navState.currentPage = navState.history.pop();
      this.saveNavState(navState);
    }
  },

  // --- Build Methods ---
  buildSyncingNotifyPanel() {
    const pendingSync = storageService.getItem("pendingPull");
    if (!pendingSync || pendingSync.length === 0) return null;

    return Panel({
      style: {
        backgroundColor: "#e22239", // red
      },
      children: [
        Text(
          {
            style: {
              fontWeight: "bold",
              fontSize: "14px",
              textAlign: "center",
              display: "block",
            },
          },
          gettext("syncing_notify")
        ),

        View({
          style: {
            ...LAYOUT_STYLES.separator,
            margin: `${SPACING.sm} 0`,
            backgroundColor: "#fff",
          },
        }),

        Text(
          {
            style: {
              fontWeight: 600,
              fontSize: "12px",
              display: "block",
            },
          },
          gettext("pending_sync_items_detected")
        ),
        // TODO: remove in production
        Text(
          {
            style: {
              display: "block",
              fontSize: "11px",
              marginTop: SPACING.xs,
              color: "#fff",
            },
          },
          pendingSync.join(", ")
        ),
      ],
    });
  },
  buildLocationPanel(currentLocation) {
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
});
