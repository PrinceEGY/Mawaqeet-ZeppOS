import * as hmUI from "@zos/ui";
import { PRAYER_ICONS, getPrayerLabel } from "../../../shared/constants";
import { BaseWidget, TextWidget } from "../../shared/widgets";
import { LAYOUT, PRAYER_STATUS_COLORS, UI_BUILDERS } from "../index.r.layout";

export class PrayerItemWidget extends BaseWidget {
  constructor({ parentWidget, pageState, prayer = {}, yOffset = 0 }) {
    super({ parentWidget, pageState });
    this.prayer = prayer;
    this.yOffset = yOffset;

    this.icon = null;
    this.labelText = null;
    this.timeText = null;
    this.remainingText = null;
    this.background = null;
  }

  onBuild() {
    this.widget = UI_BUILDERS.createGroup({
      parentWidget: this.parentWidget,
      layout: LAYOUT.PRAYER_ITEM,
      props: { y: this.yOffset },
    });

    this._buildChildWidgets();
  }

  onUpdate({ prayer } = {}) {
    if (prayer !== undefined) this.prayer = prayer;
  }

  onUpdateView() {
    const colors =
      PRAYER_STATUS_COLORS[this.prayer.status] || PRAYER_STATUS_COLORS.upcoming;

    if (this.background) {
      this.background.setProperty(hmUI.prop.VISIBLE, this.prayer.status === "next");
    }

    this.icon.setProperty(
      hmUI.prop.SRC,
      PRAYER_ICONS[this.prayer.id] || PRAYER_ICONS.fajr
    );

    this.labelText.update({
      text: getPrayerLabel(this.prayer.id),
      color: colors.name,
    });

    this.timeText.update({
      text: this.prayer.time,
      color: colors.time,
    });

    this.remainingText.update({
      text: this._calculateTimeRemaining(this.prayer.timestamp),
      color: colors.remaining,
    });
  }

  onDestroy() {
    this.labelText?.destroy();
    this.timeText?.destroy();
    this.remainingText?.destroy();
    if (this.background) hmUI.deleteWidget(this.background);

    if (this.icon) hmUI.deleteWidget(this.icon);

    this.icon = null;
    this.labelText = null;
    this.timeText = null;
    this.remainingText = null;
    this.background = null;
  }

  updateRemainingTime(now = new Date()) {
    if (!this.state.isBuilt) return;

    const timeRemaining = this._calculateTimeRemaining(
      this.prayer.timestamp,
      now
    );
    this.remainingText.update({ text: timeRemaining });
  }

  _buildChildWidgets() {
    const colors =
      PRAYER_STATUS_COLORS[this.prayer.status] || PRAYER_STATUS_COLORS.upcoming;

    this.background = this.widget.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: LAYOUT.PRAYER_ITEM.w,
      h: LAYOUT.PRAYER_ITEM.h,
      color: PRAYER_STATUS_COLORS.next.background,
      radius: LAYOUT.PRAYER_ITEM.radius,
    });
    this.background.setProperty(hmUI.prop.VISIBLE, false);

    this.icon = this.widget.createWidget(hmUI.widget.IMG, {
      ...LAYOUT.PRAYER_ITEM.ICON,
      src: PRAYER_ICONS[this.prayer.id] || PRAYER_ICONS.fajr,
    });

    this.labelText = new TextWidget({
      parentWidget: this.widget,
      pageState: this.pageState,
      layout: LAYOUT.PRAYER_ITEM.LABEL,
      text: getPrayerLabel(this.prayer.id),
      color: colors.name,
    });
    this.labelText.build();

    this.timeText = new TextWidget({
      parentWidget: this.widget,
      pageState: this.pageState,
      layout: LAYOUT.PRAYER_ITEM.TIME,
      text: this.prayer.time,
      color: colors.time,
    });
    this.timeText.build();

    this.remainingText = new TextWidget({
      parentWidget: this.widget,
      pageState: this.pageState,
      layout: LAYOUT.PRAYER_ITEM.REMAINING,
      text: this._calculateTimeRemaining(this.prayer.timestamp),
      color: colors.remaining,
    });
    this.remainingText.build();
  }

  _calculateTimeRemaining(prayerTimestamp, now = new Date()) {
    const prayerTime = new Date(prayerTimestamp);
    const timeDiff = prayerTime - now;

    if (timeDiff <= 0) return "--:--:--";

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    const hoursStr = hours.toString().padStart(2, "0");
    const minutesStr = minutes.toString().padStart(2, "0");
    const secondsStr = seconds.toString().padStart(2, "0");

    return `-${hoursStr}:${minutesStr}:${secondsStr}`;
  }
}
