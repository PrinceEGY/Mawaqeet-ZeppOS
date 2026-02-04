import { BasePage } from "@zeppos/zml/base-page";
import * as display from "@zos/display";
import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";
import { ConnectionRequirementPage } from "./connection-requirement/connection-requirement-page";
import { DebugPage } from "./debug/debug-page";
import { GlobalState } from "./global-state";
import { HomePage } from "./home/home-page";
import { OnboardingPage } from "./onboarding/onboarding-page";
import { COLORS, DEVICE_WIDTH, TYPOGRAPHY } from "./shared/index.r.layout";
import { DeviceLogger } from "./utils/device-logger";
const logger = new DeviceLogger("main-page");

let globalState = null;
let debugButtons = [];
let originalAutoBrightness = null;
let originalBrightness = null;


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
      this.createDebugButtons();
      this.navigateToInitialPage();
    },

    initializePages() {
      globalState.registerPage(
        "connectionRequirement",
        new ConnectionRequirementPage(globalState)
      );
      globalState.registerPage("debug", new DebugPage(globalState));
      globalState.registerPage("home", new HomePage(globalState));
      globalState.registerPage("onboarding", new OnboardingPage(globalState));
    },

    createDebugButtons() {
      const debugBtn = hmUI.createWidget(hmUI.widget.BUTTON, {
        x: px(10),
        y: px(10),
        w: DEVICE_WIDTH - px(20),
        h: px(80),
        text: "Debug",
        text_size: TYPOGRAPHY.SUBTITLE.size,
        color: COLORS.TITLE,
        normal_color: COLORS.PRIMARY,
        press_color: COLORS.PRIMARY_PRESSED,
        radius: px(12),
      });
      debugBtn.addEventListener(hmUI.event.CLICK_UP, () => {
        logger.debug("Opening Debug page");
        debugBtn.setProperty(hmUI.prop.VISIBLE, false);
        globalState?.currentPage?.destroy();
        if (globalState) {
          globalState.currentPage = null;
          globalState.navigate("debug");
        }
      });
      debugButtons.push(debugBtn);

      globalState.on("pageChanged", (pageName) => {
        const isDebugPage = pageName === "debug";
        debugBtn.setProperty(hmUI.prop.VISIBLE, !isDebugPage);
      });
    },

    navigateToInitialPage() {
      const initialPage = globalState.isOnboardingCompleted()
        ? "home"
        : "onboarding";
      logger.debug(`Initial page: ${initialPage}`);

      if (globalState.pages[initialPage]) {
        globalState.navigate(initialPage);
      } else {
        logger.warn(`Initial page "${initialPage}" not registered yet`);
      }
    },

    onRequest(req, res) {
      logger.debug("onRequest invoked", req.method);
      res(null, { status: "success" });
    },

    onCall(req) {
      logger.debug("onCall invoked", req.method);
      if (req.method === "pull.trigger") {
        logger.debug("Triggering pull from setting app");
        globalState.syncManager.pullFromSettingApp(req.keys);
      } else if (req.method === "sync.triggerFullSync") {
        logger.debug("Triggering full sync from setting app");
        globalState.syncManager.triggerFullSync();
      }
    },

    onDestroy() {
      logger.debug("Destroying main page");
      restoreDisplay();

      debugButtons.forEach((btn) => {
        hmUI.deleteWidget(btn);
      });
      debugButtons = [];

      globalState?.off("settingsChange", this.onSettingsChange);
      globalState?.destroy();
      globalState = null;

      logger.debug("Main page destroyed");
    },

    onSettingsChange() {
      logger.debug("Settings changed, updating current page");
      if (globalState?.currentPage?.update) {
        globalState.currentPage.update();
      }
    },
  })
);


function setupDisplay() {
  originalAutoBrightness = display.getAutoBrightness();
  originalBrightness = display.getBrightness();

  display.setPageBrightTime({ brightTime: 60000 });
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
