import * as hmUI from "@zos/ui";
import { DateUtils } from "../../shared/utils/date-utils";
import { BasePage } from "../shared/base_page";
import { TextWidget } from "../shared/widgets";
import { HomePageState } from "./home_page_state";
import { LAYOUT } from "./index.r.layout";
import { DateWidget, PrayerListWidget } from "./widgets";

export class HomePage extends BasePage {
  constructor(globalState) {
    super(globalState);
    this.scrollbar = null;
    this.onRefresh = this.onRefresh.bind(this);
  }

  onInit() {
    this.pageState = new HomePageState(this.globalState);
    this.pageState.updateEnabledPrayers();
    this.pageState.loadCurrentLocation();
    this.globalState.on("refresh", this.onRefresh);
  }

  onBuild() {
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
  }

  onShow() {
    this.scrollbar = hmUI.createWidget(hmUI.widget.PAGE_SCROLLBAR, {
      target: this.widgets.prayerList.widget,
    });
  }

  onUpdate() {
    this.pageState.loadCurrentLocation();
    this.pageState.updateEnabledPrayers();
    this.pageState.loadPrayers();
  }

  onDestroy() {
    this.globalState.off("refresh", this.onRefresh);

    if (this.scrollbar) {
      hmUI.deleteWidget(this.scrollbar);
      this.scrollbar = null;
    }
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
