import * as hmUI from "@zos/ui";
import { DateUtils } from "../../shared/utils/date-utils";
import { BasePage } from "../shared/base_page";
import { TextWidget, ButtonWidget } from "../shared/widgets";
import { HomePageState } from "./home_state";
import { LAYOUT } from "./index.r.layout";
import { DateWidget, NoLocationWidget, PrayerListWidget } from "./widgets";

export class HomePage extends BasePage {
  constructor(globalState) {
    super(globalState);
    this.scrollbar = null;
    this.onRefresh = this.onRefresh.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onLocationChange = this.onLocationChange.bind(this);
  }

  onInit() {
    this.pageState = new HomePageState(this.globalState);
    this.pageState.updateEnabledPrayers();
    this.pageState.loadCurrentLocation();
    this.pageState.loadPrayers();
    this.pageState.on("dateChange", this.onDateChange);
    this.pageState.on("locationChange", this.onLocationChange);
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
      noLocation: new NoLocationWidget({
        pageState: this.pageState,
      }),
      settingsButton: new ButtonWidget({
        pageState: this.pageState,
        layout: LAYOUT.SETTINGS_BUTTON,
        clickHandler: () => {
          this.globalState.navigate("settings");
        },
      }),
    };
    this.settingsFooter = hmUI.createWidget(hmUI.widget.FILL_RECT, LAYOUT.SETTINGS_FOOTER);
  }

  onShow() {
    this.settingsFooter?.setProperty(hmUI.prop.VISIBLE, true);
    this._createScrollbar();
    this._updateContentVisibility();
  }

  onHide() {
    this.settingsFooter?.setProperty(hmUI.prop.VISIBLE, false);
  }

  onUpdate() {
    this.pageState.loadCurrentLocation();
    this.pageState.updateEnabledPrayers();
    this.pageState.loadPrayers();
    this._updateContentVisibility();
  }

  onDestroy() {
    this.pageState?.off("dateChange", this.onDateChange);
    this.pageState?.off("locationChange", this.onLocationChange);

    if (this.settingsFooter) {
      hmUI.deleteWidget(this.settingsFooter);
      this.settingsFooter = null;
    }

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
    if (this.widgets.prayerList && this.pageState.hasLocation()) {
      this.widgets.prayerList.updateRemainingTime(now);
    }
  }

  onDateChange() {
    this._updateContentVisibility();
  }

  onLocationChange() {
    this.widgets.cityText?.update({ text: this.getCurrentCityText() });
    this._updateContentVisibility();
  }

  _createScrollbar() {
    if (!this.scrollbar && this.widgets.prayerList?.widget) {
      this.scrollbar = hmUI.createWidget(hmUI.widget.PAGE_SCROLLBAR, {
        target: this.widgets.prayerList.widget,
      });
    }
  }

  _updateContentVisibility() {
    const hasLocation = this.pageState.hasLocation();

    if (hasLocation) {
      this.widgets.noLocation?.hide();
      this.widgets.prayerList?.show();
      if (this.scrollbar) {
        this.scrollbar.setProperty(hmUI.prop.VISIBLE, true);
      }
    } else {
      this.widgets.prayerList?.hide();
      this.widgets.noLocation?.show();
      if (this.scrollbar) {
        this.scrollbar.setProperty(hmUI.prop.VISIBLE, false);
      }
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
