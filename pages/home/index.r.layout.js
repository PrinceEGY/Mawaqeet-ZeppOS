import { getDeviceInfo } from "@zos/device";
import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";
import { PRAYER_ICONS, getPrayerLabel } from "../../shared/constants";

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
    h: px(100),
    align_h: hmUI.align.CENTER_H,
    text_size: px(24),
    color: 0xffffff,
  },

  DATE_NAVIGATION: {
    DATE_TEXT: {
      x: px(140),
      y: px(50),
      w: DEVICE_WIDTH - px(280),
      h: px(80),
      align_h: hmUI.align.CENTER_H,
      text_size: px(22),
      color: 0xffffff,
    },

    TIME_TEXT: {
      x: px(80),
      y: px(120),
      w: DEVICE_WIDTH - px(160),
      h: px(40),
      align_h: hmUI.align.CENTER_H,
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
    y: px(170),
    w: DEVICE_WIDTH,
    h: DEVICE_HEIGHT - px(170),
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
};

export const UI_BUILDERS = {
  createMainContainer: () => {
    return hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
      scroll_enable: 0,
    });
  },

  createCityText: (parent, currentLocation) => {
    return parent.createWidget(hmUI.widget.TEXT, {
      ...LAYOUT.CITY_TEXT,
      text: currentLocation ? currentLocation["city"] : "No location selected",
    });
  },

  createDateText: (parent, dateText) => {
    return parent.createWidget(hmUI.widget.TEXT, {
      ...LAYOUT.DATE_NAVIGATION.DATE_TEXT,
      text: dateText,
    });
  },

  createTimeText: (parent, timeText) => {
    return parent.createWidget(hmUI.widget.TEXT, {
      ...LAYOUT.DATE_NAVIGATION.TIME_TEXT,
      text: timeText,
    });
  },

  createLeftArrow: (parent, clickHandler) => {
    return parent.createWidget(hmUI.widget.BUTTON, {
      ...LAYOUT.DATE_NAVIGATION.LEFT_ARROW,
      click_func: clickHandler,
    });
  },

  createRightArrow: (parent, clickHandler) => {
    return parent.createWidget(hmUI.widget.BUTTON, {
      ...LAYOUT.DATE_NAVIGATION.RIGHT_ARROW,
      click_func: clickHandler,
    });
  },

  createPrayersContainer: (parent) => {
    return parent.createWidget(hmUI.widget.VIEW_CONTAINER, {
      ...LAYOUT.PRAYERS_CONTAINER,
    });
  },

  createPrayerItem: (parent, prayer, yOffset) => {
    const colors =
      PRAYER_STATUS_COLORS[prayer.status] || PRAYER_STATUS_COLORS.upcoming;

    const prayerGroup = parent.createWidget(hmUI.widget.GROUP, {
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

  createSpacer: (parent, options = {}) => {
    const { x = 0, y = 0, w = px(10), h = px(50) } = options;

    return parent.createWidget(hmUI.widget.TEXT, {
      x,
      y,
      w,
      h,
    });
  },
};
