import { BasePage } from "@zeppos/zml/base-page";
import * as hmUI from "@zos/ui";
import { log as Logger, px } from "@zos/utils";
import { DateUtils } from "../../shared/utils/date-utils";
import { TextWidget } from "../shared/widgets";
import { RefreshManager } from "../utils/refresh-manager";
import { SyncManager } from "../utils/sync-manager";
import { HomePageState } from "./home_page_state";
import { LAYOUT } from "./index.r.layout";

import { replace } from "@zos/router";
import { DateWidget, PrayerListWidget } from "./widgets";

const logger = Logger.getLogger("home-page");

let syncManager = null;

Page(
  BasePage({
    state: {
      widgets: {},
      pageState: null,
    },

    onInit() {
      logger.debug("Home page initialized");
      this.state.pageState = new HomePageState();
      syncManager = new SyncManager(this.request.bind(this));
      syncManager.triggerSync();
      RefreshManager.setRefreshCallback(this.onRefresh.bind(this));
    },

    build() {
      logger.debug("Building home page UI");

      this.state.infoGroup = hmUI.createWidget(hmUI.widget.GROUP, {
        y: px(10),
      });

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

    getCurrentCityText() {
      const currentLocation = this.state.pageState.getCurrentLocation();
      return currentLocation ? currentLocation["city"] : "No location selected";
    },

    getCurrentTimeText() {
      return DateUtils.formatCurrentTime();
    },

    initializeWidgets() {
      this.state.widgets = {
        date: new DateWidget({
          pageState: this.state.pageState,
        }),

        timeText: new TextWidget({
          pageState: this.state.pageState,
          text: this.getCurrentTimeText(),
          layout: LAYOUT.DATE_NAVIGATION.TIME_TEXT,
        }),

        cityText: new TextWidget({
          pageState: this.state.pageState,
          text: this.getCurrentCityText(),
          layout: LAYOUT.CITY_TEXT,
        }),

        prayerList: new PrayerListWidget({
          pageState: this.state.pageState,
        }),
      };

      this.state.pageState.on("locationChanged", () => {
        this.updateCityText();
      });
    },

    buildAllWidgets() {
      Object.keys(this.state.widgets).forEach((widgetName) => {
        this.state.widgets[widgetName].build();
      });

      hmUI.createWidget(hmUI.widget.PAGE_SCROLLBAR, {
        target: this.state.widgets.prayerList.widget,
      });
    },

    },

    updateAllWidgets() {
      Object.keys(this.state.widgets).forEach((widgetName) => {
        this.state.widgets[widgetName].update();
      });
    },

    updateCityText() {
      if (this.state.widgets.cityText) {
        this.state.widgets.cityText.update({
          text: this.getCurrentCityText(),
        });
      }
    },

    updateTimeText() {
      if (this.state.widgets.timeText) {
        this.state.widgets.timeText.update({
          text: this.getCurrentTimeText(),
        });
      }
    },

    onRefresh() {
      this.updateTimeText();
      if (this.state.widgets.prayerList) {
        this.state.widgets.prayerList.update();
      }
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
