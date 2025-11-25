import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";
import { DeviceLogger } from "../../utils/device-logger";
import { UI_BUILDERS } from "../index.r.layout";
import { PrayerItemWidget } from "./prayer_item_widget";

const logger = new DeviceLogger("prayer-list-widget");

export class PrayerListWidget {
  constructor({ parentWidget, pageState }) {
    this.parentWidget = parentWidget;
    this.pageState = pageState;
    this.state = {
      isBuilt: false,
    };
    this.widget = null;
    this.prayerItemWidgets = [];

    this.initializePrayerItems();

    this.pageState.on("prayersChanged", this.update.bind(this));
  }

  initializePrayerItems() {
    const prayers = this.pageState.getPrayers();
    this.prayerItemWidgets = prayers.map((prayer, index) => {
      return new PrayerItemWidget({
        pageState: this.pageState,
        prayer,
        yOffset: index * 80,
      });
    });
  }

  build() {
    try {
      if (this.state.isBuilt) {
        logger.debug("Widget already built");
        return;
      }

      this.widget = UI_BUILDERS.createPrayersContainer({
        parentWidget: this.parentWidget,
      });

      this.prayerItemWidgets.forEach((prayerItemWidget) => {
        prayerItemWidget.parentWidget = this.widget;
        prayerItemWidget.build();
      });

      const yOffset = this.prayerItemWidgets.length * 80;
      UI_BUILDERS.createSpacer({
        parentWidget: this.widget,
        yOffset: yOffset,
        height: px(150),
      });

      this.state.isBuilt = true;
    } catch (error) {
      this.handleError("Failed to build prayer list widget", error);
    }
  }

  update() {
    try {
      if (!this.state.isBuilt) {
        this.build();
      }
      this.updatePrayerItems();
    } catch (error) {
      this.handleError("Failed to update prayer list widget", error);
    }
  }

  updatePrayerItems() {
    const prayers = this.pageState.getPrayers();

    if (this.prayerItemWidgets.length !== prayers.length) {
      this.clearPrayerItems();
      this.initializePrayerItems();

      if (this.state.isBuilt) {
        this.prayerItemWidgets.forEach((prayerItemWidget) => {
          prayerItemWidget.parentWidget = this.widget;
          prayerItemWidget.build();
        });
      }
      return;
    }

    prayers.forEach((prayer, index) => {
      const prayerItemWidget = this.prayerItemWidgets[index];
      if (prayerItemWidget) {
        prayerItemWidget.update({ prayer });
      }
    });
  }

  clearPrayerItems() {
    this.prayerItemWidgets.forEach((widget) => {
      widget.destroy();
    });
    this.prayerItemWidgets = [];
  }

  handleError(message, error) {
    logger.error(`${message}: ${error}`);
  }

  destroy() {
    try {
      this.pageState.off("prayersChanged", this.update.bind(this));

      this.clearPrayerItems();
      if (this.widget) {
        hmUI.deleteWidget(this.widget);
      }
      this.widget = null;
      this.state.isBuilt = false;
    } catch (error) {
      this.handleError("Failed to destroy prayer list widget", error);
    }
  }
}
