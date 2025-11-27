import { BasePage } from "@zeppos/zml/base-page";
import { GlobalState } from "./global-state";
import { HomePage } from "./home/home-page";
import { DeviceLogger } from "./utils/device-logger";
const logger = new DeviceLogger("main-page");

let globalState = null;

Page(
  BasePage({
    onInit() {
      logger.debug("Main page initialized");

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
      this.navigateToInitialPage();
    },

    initializePages() {
      globalState.registerPage("home", new HomePage(globalState));
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

      if (globalState) {
        globalState.off("settingsChange", this.onSettingsChange);
        globalState.destroy();
        globalState = null;
      }

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
