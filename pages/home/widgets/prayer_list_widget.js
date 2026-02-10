import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";
import { BaseWidget } from "../../shared/widgets";
import { LAYOUT, UI_BUILDERS } from "../index.r.layout";
import { PrayerItemWidget } from "./prayer_item_widget";

export class PrayerListWidget extends BaseWidget {
  constructor({ parentWidget, pageState }) {
    super({ parentWidget, pageState });

    this.prayerItemWidgets = [];
    this.spacerWidget = null;

    this.onPrayersChange = this.updateView.bind(this);
  }

  onBuild() {
    this.widget = UI_BUILDERS.createViewContainer({
      parentWidget: this.parentWidget,
      layout: LAYOUT.PRAYERS_CONTAINER,
    });

    this._buildPrayerItems();
    this.pageState.on("prayersChange", this.onPrayersChange);
  }

  onShow() {
    this.prayerItemWidgets.forEach((item) => item.show());
  }

  onHide() {
    this.prayerItemWidgets.forEach((item) => item.hide());
  }

  onUpdateView() {
    const prayers = this.pageState.getPrayers();

    if (this.prayerItemWidgets.length !== prayers.length) {
      this._clearPrayerItems();
      this._buildPrayerItems();
      return;
    }

    prayers.forEach((prayer, index) => {
      this.prayerItemWidgets[index]?.update({ prayer });
    });
  }

  onDestroy() {
    this.pageState.off("prayersChange", this.onPrayersChange);
    this._clearPrayerItems();
  }

  updateRemainingTime(now = new Date()) {
    if (!this.state.isBuilt) return;

    for (let i = 0; i < this.prayerItemWidgets.length; i++) {
      this.prayerItemWidgets[i].updateRemainingTime(now);
    }
  }

  _buildPrayerItems() {
    const prayers = this.pageState.getPrayers();
    const itemSpacing = LAYOUT.PRAYER_ITEM.SPACING;

    this.prayerItemWidgets = prayers.map((prayer, index) => {
      const item = new PrayerItemWidget({
        parentWidget: this.widget,
        pageState: this.pageState,
        prayer,
        yOffset: index * itemSpacing,
      });
      item.build();
      return item;
    });

    const yOffset = this.prayerItemWidgets.length * itemSpacing;
    this.spacerWidget = UI_BUILDERS.createSpacer({
      parentWidget: this.widget,
      yOffset: yOffset,
      height: px(100),
    });
  }

  _clearPrayerItems() {
    this.prayerItemWidgets.forEach((widget) => widget.destroy());
    this.prayerItemWidgets = [];

    if (this.spacerWidget) {
      hmUI.deleteWidget(this.spacerWidget);
      this.spacerWidget = null;
    }
  }
}
