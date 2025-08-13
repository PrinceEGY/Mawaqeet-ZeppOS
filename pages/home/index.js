import { BasePage } from "@zeppos/zml/base-page";
import * as hmUI from "@zos/ui";
import { log as Logger, px } from "@zos/utils";
import { RefreshManager } from "../utils/refresh-manager";
import { SyncManager } from "../utils/sync-manager";
import { HomePageState } from "./home_page_state";
import { UI_BUILDERS } from "./index.r.layout";

import { replace } from "@zos/router";
import {
  CityWidget,
  DateWidget,
  PrayerListWidget,
  TimeWidget,
} from "./widgets";

const logger = Logger.getLogger("home-page");

let syncManager = null;

Page(
  BasePage({
    state: {
      widgets: {},
      mainContainer: null,
      infoGroup: null,
      pageState: null,
    },

    onInit() {
      logger.debug("Home page initialized");
      this.state.pageState = new HomePageState();
    },

    build() {
      logger.debug("Building home page UI");
      this.state.mainContainer = UI_BUILDERS.createMainContainer();

      this.state.infoGroup = this.state.mainContainer.createWidget(
        hmUI.widget.GROUP,
        { y: px(10) }
      );

      this.initializeWidgets();
      this.buildAllWidgets();
    },

    onRequest(req, res) {
      logger.debug("onRequest invoked", req.method);
      res(null, { status: "success" });
    },

    onCall(req) {
      logger.debug("onCall invoked", req.method);
      if (req.method === "sync.triggerSync") {
        syncManager.triggerSync(req.keys);
        setTimeout(() => {
          this.reloadPage();
        }, 2000);
      }
    },

    onDestroy() {
      logger.debug("Destroying home page");
      this.destroyAllWidgets();
      if (this.state.pageState) {
        this.state.pageState.destroy();
      }
      RefreshManager.clear();
    },

    initializeWidgets() {
      syncManager = new SyncManager(this.request.bind(this));
      syncManager.triggerSync();

      this.state.widgets = {
        date: new DateWidget(this.state.infoGroup, this.state.pageState),

        time: new TimeWidget(this.state.infoGroup),

        city: new CityWidget(this.state.infoGroup, this.state.pageState),

        prayerList: new PrayerListWidget(
          this.state.mainContainer,
          this.state.pageState
        ),
      };

      RefreshManager.setRefreshCallback(this.onRefresh.bind(this));
    },

    buildAllWidgets() {
      Object.keys(this.state.widgets).forEach((widgetName) => {
        this.state.widgets[widgetName].build();
      });
    },

    updateAllWidgets() {
      Object.keys(this.state.widgets).forEach((widgetName) => {
        this.state.widgets[widgetName].update();
      });
    },

    onRefresh() {
      this.state.widgets.time.updateView();
      this.state.widgets.prayerList.update();
    },

    onGlobalUpdate() {
      logger.debug("Global update triggered");
      this.state.pageState.updateEnabledPrayers();
      this.state.widgets.city.update();
    },

    reloadPage() {
      replace({ url: "pages/home/index" });
    },

    destroyAllWidgets() {
      Object.keys(this.state.widgets).forEach((widgetName) => {
        try {
          this.state.widgets[widgetName].destroy();
        } catch (error) {
          logger.error(`Error destroying widget ${widgetName}: ${error}`);
        }
      });

      this.state.widgets = {};
      logger.debug("All widgets destroyed");
    },
  })
);
