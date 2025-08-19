import * as hmUI from "@zos/ui";
import { log as Logger, px } from "@zos/utils";
import { UI_BUILDERS } from "../index.r.layout";
import { PrayerItemWidget } from "./prayer_item_widget";

const logger = Logger.getLogger("prayer-list-widget");

export class PrayerListWidget {
  constructor(parentContainer, pageState) {
    this.parentContainer = parentContainer;
    this.pageState = pageState;
    this.state = {
      isBuilt: false,
    };
    this.widget = null;
    this.prayerItemWidgets = [];

    this.pageState.on("prayersChanged", this.update.bind(this));
  }

  build() {
    try {
      if (this.state.isBuilt) {
        logger.debug("Widget already built");
        return;
      }

      this.widget = UI_BUILDERS.createPrayersContainer(this.parentContainer);
      this.createPrayerItems();

      this.state.isBuilt = true;
    } catch (error) {
      this.handleError("Failed to build prayer list widget", error);
    }
  }

  update() {
    try {
      if (this.state.isBuilt) {
        this.updatePrayerItems();
      } else {
        this.build();
      }
    } catch (error) {
      this.handleError("Failed to update prayer list widget", error);
    }
  }

  createPrayerItems() {
    this.clearPrayerItems();

    const prayers = this.pageState.getPrayers();
    let yOffset = 0;

    prayers.forEach((prayer) => {
      const prayerItemWidget = new PrayerItemWidget(
        this.widget,
        prayer,
        yOffset
      );
      prayerItemWidget.build();
      this.prayerItemWidgets.push(prayerItemWidget);
      yOffset += 80;
    });

    UI_BUILDERS.createSpacer(this.widget, {
      y: yOffset,
      w: px(10),
      h: px(125),
    });
  }

  updatePrayerItems() {
    const prayers = this.pageState.getPrayers();

    if (this.prayerItemWidgets.length !== prayers.length) {
      this.createPrayerItems();
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
