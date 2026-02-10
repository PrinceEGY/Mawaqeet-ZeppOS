import { BasePage } from "@zeppos/zml/base-page";
import * as display from "@zos/display";
import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";
import { onKey, offKey, KEY_BACK, KEY_EVENT_CLICK } from "@zos/interaction";
import { DebugPage } from "./debug/debug-page";
import { GlobalState } from "./global-state";
import { HomePage } from "./home/home-page";
import { SyncIndicatorWidget } from "./home/widgets/sync_indicator_widget";
import { SettingsPage } from "./settings/settings-page";
import { COLORS, DEVICE_WIDTH, TYPOGRAPHY } from "./shared/index.r.layout";
import { DeviceLogger } from "./utils/device-logger";
const logger = new DeviceLogger("main-page");

let globalState = null;
let originalAutoBrightness = null;
let originalBrightness = null;
let syncIndicatorWidget = null;


Page(
  BasePage({
    onInit() {
      logger.debug("Main page initialized");
      setupDisplay();
      globalState = new GlobalState(
        this.request.bind(this),
        this.call.bind(this)
      );
      globalState.init();
      globalState.on("settingsChange", this.onSettingsChange);
    },

    build() {
      logger.debug("Building main page");
      this.initializePages();
      this.createSyncIndicator();
      this.setupPhysicalBackButton();
      this.navigateToInitialPage();
    },

    setupPhysicalBackButton() {
      onKey({
        callback: (key, keyEvent) => {
          if (key === KEY_BACK && keyEvent === KEY_EVENT_CLICK) {
            logger.debug("Back key pressed");
            return globalState.goBack();
          }
          return false;
        },
      });
    },

    initializePages() {
      globalState.registerPage("debug", new DebugPage(globalState));
      globalState.registerPage("home", new HomePage(globalState));
      globalState.registerPage("settings", new SettingsPage(globalState));
    },

    createSyncIndicator() {
      syncIndicatorWidget = new SyncIndicatorWidget({
        parentWidget: hmUI,
        globalState: globalState,
      });
      syncIndicatorWidget.build();
      syncIndicatorWidget.update();
    },

    navigateToInitialPage() {
      const initialPage = "home";
      logger.debug(`Initial page: ${initialPage}`);

      if (globalState.pages[initialPage]) {
        globalState.navigate(initialPage);
      } else {
        logger.warn(`Initial page "${initialPage}" not registered yet`);
      }
    },

    onRequest(req, res) {
      logger.debug("onRequest invoked", req.method);
      if (req.method === "app.reset") {
        logger.info("Device received app.reset request");
        res(null, { status: "resetting" });

        globalState.resetApp();
      } else {
        res(null, { status: "success" });
      }
    },

    onCall(req) {
      logger.debug("onCall invoked", req.method);
      if (req.method === "sync.pending") {
        globalState.setSyncPending();
      }
    },

    onDestroy() {
      logger.debug("Destroying main page");
      restoreDisplay();

      if (syncIndicatorWidget) {
        syncIndicatorWidget.destroy();
        syncIndicatorWidget = null;
      }

      globalState?.off("settingsChange", this.onSettingsChange);
      offKey();
      globalState?.destroy();
      globalState = null;

      logger.debug("Main page destroyed");
    },

    onSettingsChange() {
      logger.debug("Settings changed, updating current page");

      // This is an optimizaion to decrease freezing time on first app launch 
      if (!globalState.isAppInitialized()) {
        return;
      }

      if (globalState?.currentPage?.update) {
        globalState.currentPage.update();
      }
    },
  })
);


function setupDisplay() {
  originalAutoBrightness = display.getAutoBrightness();
  originalBrightness = display.getBrightness();

  display.setPageBrightTime({ brightTime: 30000 });
  display.setAutoBrightness({ autoBright: false });
  display.setBrightness({ brightness: 100 });
  display.pauseDropWristScreenOff({ duration: 15000 });
}

function restoreDisplay() {
  display.resetDropWristScreenOff();
  if (originalAutoBrightness !== null) {
    display.setAutoBrightness({ autoBright: originalAutoBrightness });
  }
  if (originalBrightness !== null && !originalAutoBrightness) {
    display.setBrightness({ brightness: originalBrightness });
  }
}
