import { getDeviceInfo } from "@zos/device";
import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";
import { PRAYER_ICONS, getPrayerLabel } from "../../shared/constants";
import { SHARED_UI_BUILDERS } from "../shared/index.r.layout";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

export const PRAYER_STATUS_COLORS = {
  passed: {
    name: 0x666666, // Gray for passed prayers
    time: 0x666666,
    remaining: 0x444444,
    background: 0x1a1a1a, // Darker background
  },
  next: {
    name: 0x00ff00, // Green for next prayer
    time: 0x00ff00,
    remaining: 0x00cc00,
    background: 0x003300, // Dark green background
  },
  upcoming: {
    name: 0xffffff, // White for upcoming prayers
    time: 0xffffff,
    remaining: 0x888888,
    background: 0x000000, // Black background
  },
};

export const LAYOUT = {
  CITY_TEXT: {
    x: px(120),
    y: px(5),
    w: DEVICE_WIDTH - px(240),
    h: px(40),
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_size: px(24),
    color: 0xffffff,
  },

  DATE_NAVIGATION: {
    DATE_TEXT: {
      x: px(140),
      y: px(45),
      w: DEVICE_WIDTH - px(280),
      h: px(90),
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text_size: px(20),
      color: 0xffffff,
    },

    TIME_TEXT: {
      x: px(80),
      y: px(130),
      w: DEVICE_WIDTH - px(160),
      h: px(40),
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text_size: px(24),
      color: 0xffffff,
    },

    LEFT_ARROW: {
      x: px(90),
      y: px(60),
      w: px(50),
      h: px(50),
      normal_src: "left_arrow.png",
      press_src: "left_arrow.png",
    },

    RIGHT_ARROW: {
      x: DEVICE_WIDTH - px(140),
      y: px(60),
      w: px(50),
      h: px(50),
      normal_src: "right_arrow.png",
      press_src: "right_arrow.png",
    },
  },

  PRAYERS_CONTAINER: {
    x: px(0),
    y: px(180),
    w: DEVICE_WIDTH,
    h: DEVICE_HEIGHT - px(180),
    scroll_enable: 1,
  },

  PRAYER_ITEM: {
    x: px(10),
    w: DEVICE_WIDTH - px(20),
    h: px(110),

    ICON: {
      x: px(15),
      y: px(30),
      w: px(40),
      h: px(40),
      auto_scale: true,
    },

    NAME: {
      x: px(80),
      y: px(30),
      w: px(160),
      h: px(40),
      text_size: px(26),
      color: 0xffffff,
      align_v: hmUI.align.CENTER_V,
    },

    TIME: {
      x: DEVICE_WIDTH - px(190),
      y: px(20),
      w: px(160),
      h: px(35),
      text_size: px(24),
      color: 0xffffff,
      align_h: hmUI.align.RIGHT,
      align_v: hmUI.align.CENTER_V,
    },

    REMAINING: {
      x: DEVICE_WIDTH - px(190),
      y: px(55),
      w: px(160),
      h: px(35),
      text_size: px(20),
      color: 0x888888,
      align_h: hmUI.align.RIGHT,
      align_v: hmUI.align.CENTER_V,
    },
  },

  DATE_PICKER: {
    CONTAINER: {
      x: px(0),
      y: px(0),
      w: DEVICE_WIDTH,
      h: DEVICE_HEIGHT,
      z_index: 1,
      scroll_enable: 0,
    },

    PICKER: {
      x: px(40),
      y: px(100),
      w: DEVICE_WIDTH - px(80),
      font_size: px(24),
    },

    HINT_TEXT: {
      x: px(10),
      y: px(290),
      w: DEVICE_WIDTH - px(20),
      h: px(60),
      text_size: px(16),
      color: 0xaaaaaa,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    },

    CONFIRM_BUTTON: {
      x: px(60),
      y: px(350),
      w: px(140),
      h: px(60),
      text_size: px(24),
      color: 0xffffff,
      normal_color: 0x00ff00,
      press_color: 0x00aa00,
      radius: px(10),
      text: "Confirm",
    },

    CANCEL_BUTTON: {
      x: DEVICE_WIDTH - px(200),
      y: px(350),
      w: px(140),
      h: px(60),
      text_size: px(24),
      color: 0xffffff,
      normal_color: 0xff0000,
      press_color: 0xaa0000,
      radius: px(10),
      text: "Cancel",
    },
  },
};

export const UI_BUILDERS = {
  createText: SHARED_UI_BUILDERS.createText,

  createSpacer: SHARED_UI_BUILDERS.createSpacer,

  createLeftArrow: ({ parentWidget = hmUI, clickHandler }) => {
    return parentWidget.createWidget(hmUI.widget.BUTTON, {
      ...LAYOUT.DATE_NAVIGATION.LEFT_ARROW,
      click_func: clickHandler,
    });
  },

  createRightArrow: ({ parentWidget = hmUI, clickHandler }) => {
    return parentWidget.createWidget(hmUI.widget.BUTTON, {
      ...LAYOUT.DATE_NAVIGATION.RIGHT_ARROW,
      click_func: clickHandler,
    });
  },

  createPrayersContainer: ({ parentWidget = hmUI }) => {
    return parentWidget.createWidget(hmUI.widget.VIEW_CONTAINER, {
      ...LAYOUT.PRAYERS_CONTAINER,
    });
  },

  createPrayerItem: ({ parentWidget = hmUI, prayer, yOffset }) => {
    const colors =
      PRAYER_STATUS_COLORS[prayer.status] || PRAYER_STATUS_COLORS.upcoming;

    const prayerGroup = parentWidget.createWidget(hmUI.widget.GROUP, {
      ...LAYOUT.PRAYER_ITEM,
      y: yOffset,
    });

    const icon = prayerGroup.createWidget(hmUI.widget.IMG, {
      ...LAYOUT.PRAYER_ITEM.ICON,
      src: PRAYER_ICONS[prayer.name] || PRAYER_ICONS.fajr,
    });

    const name = prayerGroup.createWidget(hmUI.widget.TEXT, {
      ...LAYOUT.PRAYER_ITEM.NAME,
      text: getPrayerLabel(prayer.name),
      color: colors.name,
    });

    const time = prayerGroup.createWidget(hmUI.widget.TEXT, {
      ...LAYOUT.PRAYER_ITEM.TIME,
      text: prayer.time,
      color: colors.time,
    });

    const remaining = prayerGroup.createWidget(hmUI.widget.TEXT, {
      ...LAYOUT.PRAYER_ITEM.REMAINING,
      text: prayer.remaining,
      color: colors.remaining,
    });

    return { group: prayerGroup, icon, name, time, remaining };
  },

  createDatePickerUI: ({ currentDate, dateRange, onConfirm, onCancel }) => {
    const container = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
      ...LAYOUT.DATE_PICKER.CONTAINER,
    });

    container.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 100,
      w: DEVICE_WIDTH,
      h: DEVICE_HEIGHT,
    });

    const datePicker = container.createWidget(hmUI.widget.PICK_DATE, {
      ...LAYOUT.DATE_PICKER.PICKER,
      startYear: dateRange.startYear,
      endYear: dateRange.endYear,
      initYear: currentDate.getFullYear(),
      initMonth: currentDate.getMonth() + 1,
      initDay: currentDate.getDate(),
    });

    const hintText = `Prayer times are available from (${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()})`;

    const hint = container.createWidget(hmUI.widget.TEXT, {
      ...LAYOUT.DATE_PICKER.HINT_TEXT,
      text: hintText,
    });

    const confirmButton = container.createWidget(hmUI.widget.BUTTON, {
      ...LAYOUT.DATE_PICKER.CONFIRM_BUTTON,
      click_func: onConfirm,
    });

    const cancelButton = container.createWidget(hmUI.widget.BUTTON, {
      ...LAYOUT.DATE_PICKER.CANCEL_BUTTON,
      click_func: onCancel,
    });

    return {
      container,
      datePicker,
      hint,
      confirmButton,
      cancelButton,
    };
  },
};
