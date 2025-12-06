import { getDeviceInfo } from "@zos/device";
import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";
import {
  COLORS,
  SHARED_UI_BUILDERS,
  TYPOGRAPHY,
} from "../shared/index.r.layout";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

export const PRAYER_STATUS_COLORS = {
  passed: {
    name: COLORS.BODY,
    time: COLORS.BODY,
    remaining: COLORS.BODY,
  },
  next: {
    name: COLORS.PRIMARY,
    time: COLORS.PRIMARY,
    remaining: COLORS.PRIMARY_PRESSED,
  },
  upcoming: {
    name: COLORS.TITLE,
    time: COLORS.TITLE,
    remaining: COLORS.BODY,
  },
};

export const LAYOUT = {
  CITY_TEXT: {
    x: px(120),
    y: px(15),
    w: DEVICE_WIDTH - px(240),
    h: TYPOGRAPHY.BODY.lineHeight,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_size: TYPOGRAPHY.BODY.size,
    color: COLORS.TITLE,
  },

  DATE_NAVIGATION: {
    CONTAINER: {
      x: 0,
      y: px(45),
      w: DEVICE_WIDTH,
      h: px(90),
    },

    DATE_TEXT: {
      x: px(140),
      y: 0,
      w: DEVICE_WIDTH - px(280),
      h: px(90),
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text_size: TYPOGRAPHY.BODY.size,
      color: COLORS.TITLE,
    },

    TIME_TEXT: {
      x: px(80),
      y: px(130),
      w: DEVICE_WIDTH - px(160),
      h: TYPOGRAPHY.BODY.lineHeight,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text_size: TYPOGRAPHY.BODY.size,
      color: COLORS.TITLE,
    },

    LEFT_ARROW: {
      x: px(90),
      y: px(15),
      w: px(50),
      h: px(50),
      normal_src: "left_arrow.png",
      press_src: "left_arrow.png",
    },

    RIGHT_ARROW: {
      x: DEVICE_WIDTH - px(140),
      y: px(15),
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
      h: TYPOGRAPHY.BODY.lineHeight,
      text_size: TYPOGRAPHY.BODY.size,
      color: COLORS.TITLE,
      align_v: hmUI.align.CENTER_V,
    },

    TIME: {
      x: DEVICE_WIDTH - px(190),
      y: px(20),
      w: px(160),
      h: TYPOGRAPHY.BODY.lineHeight,
      text_size: TYPOGRAPHY.BODY.size,
      color: COLORS.TITLE,
      align_h: hmUI.align.RIGHT,
      align_v: hmUI.align.CENTER_V,
    },

    REMAINING: {
      x: DEVICE_WIDTH - px(190),
      y: px(55),
      w: px(160),
      h: TYPOGRAPHY.BODY_SECONDARY.lineHeight,
      text_size: TYPOGRAPHY.BODY_SECONDARY.size,
      color: COLORS.BODY,
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
      z_index: 100,
      scroll_enable: 0,
    },

    PICKER: {
      x: px(40),
      y: px(100),
      w: DEVICE_WIDTH - px(80),
      font_size: TYPOGRAPHY.BODY_SECONDARY.size,
    },

    HINT_TEXT: {
      x: px(10),
      y: px(290),
      w: DEVICE_WIDTH - px(20),
      h: px(60),
      text_size: TYPOGRAPHY.BODY_SECONDARY.size,
      color: COLORS.SUBTITLE,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    },

    CONFIRM_BUTTON: {
      x: px(60),
      y: px(350),
      w: px(140),
      h: px(60),
      text_size: TYPOGRAPHY.BODY.size,
      color: COLORS.TITLE,
      normal_color: COLORS.PRIMARY,
      press_color: COLORS.PRIMARY_PRESSED,
      radius: px(10),
      text: "Confirm",
    },

    CANCEL_BUTTON: {
      x: DEVICE_WIDTH - px(200),
      y: px(350),
      w: px(140),
      h: px(60),
      text_size: TYPOGRAPHY.BODY.size,
      color: COLORS.TITLE,
      normal_color: COLORS.ERROR,
      press_color: COLORS.ERROR_PRESSED,
      radius: px(10),
      text: "Cancel",
    },
  },
};

export const UI_BUILDERS = {
  createText: SHARED_UI_BUILDERS.createText,
  createSpacer: SHARED_UI_BUILDERS.createSpacer,
  createGroup: SHARED_UI_BUILDERS.createGroup,
  createViewContainer: SHARED_UI_BUILDERS.createViewContainer,

  createDatePicker: ({ parentWidget, currentDate, dateRange }) => {
    const backgroundRect = parentWidget.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 100,
      w: DEVICE_WIDTH,
      h: DEVICE_HEIGHT,
    });

    const picker = parentWidget.createWidget(hmUI.widget.PICK_DATE, {
      ...LAYOUT.DATE_PICKER.PICKER,
      startYear: dateRange.startYear,
      endYear: dateRange.endYear,
      initYear: currentDate.getFullYear(),
      initMonth: currentDate.getMonth() + 1,
      initDay: currentDate.getDate(),
    });

    return { picker, backgroundRect };
  },
};
