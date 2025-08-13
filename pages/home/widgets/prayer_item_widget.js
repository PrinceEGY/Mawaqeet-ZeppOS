import * as hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { PRAYER_ICONS, getPrayerLabel } from "../../../shared/constants";
import { PRAYER_STATUS_COLORS, UI_BUILDERS } from "../index.r.layout";

const logger = Logger.getLogger("prayer-item-widget");

export class PrayerItemWidget {
  constructor(parentContainer, prayer = {}, yOffset = 0) {
    this.parentContainer = parentContainer;
    this.state = {
      prayer: prayer,
      yOffset: yOffset,
      isBuilt: false,
    };
    this.widget = null;
  }

  build() {
    try {
      if (this.state.isBuilt) {
        logger.debug("Widget already built");
        return;
      }

      this.widget = UI_BUILDERS.createPrayerItem(
        this.parentContainer,
        this.state.prayer,
        this.state.yOffset
      );

      this.state.isBuilt = true;
    } catch (error) {
      this.handleError("Failed to build prayer item widget", error);
    }
  }

  update({ prayer } = {}) {
    try {
      if (prayer !== undefined) {
        this.state.prayer = prayer;
      }

      if (this.state.isBuilt) {
        this.updateView();
      } else {
        this.build();
      }
    } catch (error) {
      this.handleError("Failed to update prayer item widget", error);
    }
  }

  updateView() {
    if (!this.widget) return;

    const prayer = this.state.prayer;
    const colors =
      PRAYER_STATUS_COLORS[prayer.status] || PRAYER_STATUS_COLORS.upcoming;

    this.widget.name.setProperty(hmUI.prop.TEXT, getPrayerLabel(prayer.name));
    this.widget.name.setProperty(hmUI.prop.COLOR, colors.name);

    this.widget.time.setProperty(hmUI.prop.TEXT, prayer.time);
    this.widget.time.setProperty(hmUI.prop.COLOR, colors.time);

    const timeRemaining = this.calculateTimeRemaining(prayer.timestamp);
    this.widget.remaining.setProperty(hmUI.prop.TEXT, timeRemaining);
    this.widget.remaining.setProperty(hmUI.prop.COLOR, colors.remaining);

    const iconPath = PRAYER_ICONS[prayer.name] || PRAYER_ICONS.fajr;
    this.widget.icon.setProperty(hmUI.prop.SRC, iconPath);
  }

  calculateTimeRemaining(prayerTimestamp, now = new Date()) {
    try {
      const prayerTime = new Date(prayerTimestamp);
      const timeDiff = prayerTime - now;

      if (timeDiff <= 0) {
        return "--:--:--";
      }

      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      const hoursStr = hours.toString().padStart(2, "0");
      const minutesStr = minutes.toString().padStart(2, "0");
      const secondsStr = seconds.toString().padStart(2, "0");

      return `${hoursStr}:${minutesStr}:${secondsStr}`;
    } catch (error) {
      logger.error(`Error calculating time remaining: ${error}`);
      return "--:--:--";
    }
  }

  handleError(message, error) {
    logger.error(`${message}: ${error}`);
  }

  destroy() {
    try {
      if (this.widget) {
        hmUI.deleteWidget(this.widget);
      }
      this.widget = null;
      this.state.isBuilt = false;
    } catch (error) {
      this.handleError("Failed to destroy prayer item widget", error);
    }
  }
}
