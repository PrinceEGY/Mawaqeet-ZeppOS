import * as hmUI from "@zos/ui";
import { DateUtils } from "../../shared/utils/date-utils";
import { TextWidget } from "../shared/widgets";
import { DeviceLogger } from "../utils/device-logger";
import { HomePageState } from "./home_page_state";
import { LAYOUT } from "./index.r.layout";
import { DateWidget, PrayerListWidget } from "./widgets";

const logger = new DeviceLogger("home-page");

export class HomePage {
  constructor(globalState) {
    this.globalState = globalState;
    this.pageState = null;
    this.widgets = {};
    this.scrollbar = null;
    this.isBuilt = false;
    this.isVisible = false;

    this.onRefresh = this.onRefresh.bind(this);
  }

  init() {
    this.pageState = new HomePageState(this.globalState);
    this.pageState.updateEnabledPrayers();
    this.pageState.loadCurrentLocation();
    this.globalState.on("refresh", this.onRefresh);
    logger.debug("HomePage initialized");
  }

  build() {
    if (this.isBuilt) return;
    logger.debug("Building HomePage");

    this.widgets = {
      date: new DateWidget({
        pageState: this.pageState,
      }),
      timeText: new TextWidget({
        pageState: this.pageState,
        text: this.getCurrentTimeText(),
        layout: LAYOUT.DATE_NAVIGATION.TIME_TEXT,
      }),
      cityText: new TextWidget({
        pageState: this.pageState,
        text: this.getCurrentCityText(),
        layout: LAYOUT.CITY_TEXT,
      }),
      prayerList: new PrayerListWidget({
        pageState: this.pageState,
      }),
    };

    Object.values(this.widgets).forEach((widget) => widget.build());

    this.scrollbar = hmUI.createWidget(hmUI.widget.PAGE_SCROLLBAR, {
      target: this.widgets.prayerList.widget,
    });

    this.isBuilt = true;
    logger.debug("HomePage built");
  }

  show() {
    if (!this.isBuilt || this.isVisible) return;
    logger.debug("Showing HomePage");

    Object.values(this.widgets).forEach((widget) => widget.show());
    this.isVisible = true;
  }

  hide() {
    if (!this.isVisible) return;
    logger.debug("Hiding HomePage");

    Object.values(this.widgets).forEach((widget) => widget.hide());
    this.isVisible = false;
  }

  update() {
    if (!this.isBuilt) return;
    logger.debug("Updating HomePage");

    this.pageState.loadCurrentLocation();
    this.pageState.updateEnabledPrayers();
    this.pageState.loadPrayers();
    Object.values(this.widgets).forEach((widget) => {
      if (widget.updateView) widget.updateView();
    });
  }

  destroy() {
    logger.debug("Destroying HomePage");

    this.globalState.off("refresh", this.onRefresh);

    Object.values(this.widgets).forEach((widget) => {
      try {
        widget.destroy();
      } catch (e) {
        logger.error("Error destroying widget:", e);
      }
    });

    if (this.scrollbar) {
      hmUI.deleteWidget(this.scrollbar);
      this.scrollbar = null;
    }

    this.pageState.destroy();
    this.widgets = {};
    this.isBuilt = false;
    this.isVisible = false;
  }

  onRefresh() {
    const now = new Date();
    if (this.widgets.timeText) {
      this.widgets.timeText.update({ text: this.getCurrentTimeText(now) });
    }
    if (this.widgets.prayerList) {
      this.widgets.prayerList.updateRemainingTime(now);
    }
  }

  getCurrentCityText() {
    const location = this.pageState.getCurrentLocation();
    return location?.city || "No location selected";
  }

  getCurrentTimeText(now = new Date()) {
    return DateUtils.formatCurrentTime(now);
  }
}
