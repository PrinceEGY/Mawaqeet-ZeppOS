import { getDeviceInfo } from "@zos/device";
import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";
import {
  COLORS,
  SHARED_UI_BUILDERS,
  TYPOGRAPHY,
} from "../shared/index.r.layout";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

export const LAYOUT = {
  PAGE_INDICATOR: {
    x: px(160),
    y: DEVICE_HEIGHT - px(30),
    w: DEVICE_WIDTH - px(320),
    h: px(10),
    align_h: hmUI.align.CENTER_H,
    horizontal: true,
    h_space: 8,
    element_height: px(8),
    element_radius: px(4),
  },

  // Welcome Screen (Page 0)
  WELCOME: {
    APP_ICON: {
      x: (DEVICE_WIDTH - px(160)) / 2,
      y: px(50),
      w: px(160),
      h: px(160),
    },
    TITLE: {
      x: px(70),
      y: px(240),
      w: DEVICE_WIDTH - px(140),
      h: TYPOGRAPHY.TITLE.lineHeight,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text_size: TYPOGRAPHY.TITLE.size,
      color: COLORS.TITLE,
    },
    TAGLINE: {
      x: px(70),
      y: px(290),
      w: DEVICE_WIDTH - px(140),
      h: TYPOGRAPHY.BODY.lineHeight,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text_size: TYPOGRAPHY.BODY.size,
      color: COLORS.SUBTITLE,
    },
    FOOTER: {
      x: px(70),
      y: DEVICE_HEIGHT - px(90),
      w: DEVICE_WIDTH - px(140),
      h: TYPOGRAPHY.BODY_SECONDARY.lineHeight,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text_size: TYPOGRAPHY.BODY_SECONDARY.size,
      color: COLORS.BODY,
    },
  },

  // Setup Screen (Page 1) - Instructions
  SETUP: {
    CONNECTION_IMAGE: {
      x: (DEVICE_WIDTH - px(120)) / 2,
      y: px(30),
      w: px(120),
      h: px(120),
    },
    INSTRUCTION_TITLE: {
      x: px(70),
      y: px(160),
      w: DEVICE_WIDTH - px(140),
      h: TYPOGRAPHY.TITLE.lineHeight,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text_size: TYPOGRAPHY.TITLE.size,
      color: COLORS.TITLE,
    },
    INSTRUCTION_STEP: {
      x: px(70),
      y: px(0),
      w: DEVICE_WIDTH - px(140),
      h: TYPOGRAPHY.BODY_SECONDARY.lineHeight,
      align_h: hmUI.align.LEFT,
      align_v: hmUI.align.CENTER_V,
      text_size: TYPOGRAPHY.BODY_SECONDARY.size,
      color: COLORS.SUBTITLE,
      text_style: hmUI.text_style.WRAP,
    },
    INSTRUCTION_NOTE: {
      x: px(70),
      y: px(0),
      w: DEVICE_WIDTH - px(140),
      h: TYPOGRAPHY.BODY_SECONDARY.lineHeight,
      align_h: hmUI.align.LEFT,
      align_v: hmUI.align.CENTER_V,
      text_size: TYPOGRAPHY.BODY_SECONDARY.size,
      color: COLORS.BODY,
      text_style: hmUI.text_style.WRAP,
    },
  },

  // Status Screen (Page 2)
  STATUS: {
    STATUS_IMAGE: {
      x: (DEVICE_WIDTH - px(200)) / 2,
      y: px(20),
      w: px(200),
      h: px(200),
    },
    REQUIREMENTS_TITLE: {
      x: px(70),
      y: px(230),
      w: DEVICE_WIDTH - px(140),
      h: TYPOGRAPHY.TITLE.lineHeight,
      align_h: hmUI.align.LEFT,
      align_v: hmUI.align.CENTER_V,
      text_size: TYPOGRAPHY.TITLE.size,
      color: COLORS.TITLE,
    },
    REQUIREMENT_ITEM: {
      x: px(70),
      y: px(0),
      w: DEVICE_WIDTH - px(140),
      h: TYPOGRAPHY.BODY_SECONDARY.lineHeight,
      align_h: hmUI.align.LEFT,
      align_v: hmUI.align.CENTER_V,
      text_size: TYPOGRAPHY.BODY_SECONDARY.size,
      text_style: hmUI.text_style.WRAP,
    },
    SYNC_BUTTON: {
      x: px(70),
      y: DEVICE_HEIGHT - px(110),
      w: DEVICE_WIDTH - px(140),
      h: px(50),
      text: "Sync Now",
      text_size: TYPOGRAPHY.BODY.size,
      color: COLORS.TITLE,
      normal_color: COLORS.PRIMARY,
      press_color: COLORS.PRIMARY_PRESSED,
      radius: px(25),
    },
    SYNC_BUTTON_DISABLED: {
      x: px(70),
      y: DEVICE_HEIGHT - px(110),
      w: DEVICE_WIDTH - px(140),
      h: px(50),
      text: "Syncing...",
      text_size: TYPOGRAPHY.BODY.size,
      color: COLORS.TITLE,
      normal_color: COLORS.BODY,
      press_color: COLORS.BODY,
      radius: px(25),
    },
    CONTINUE_BUTTON: {
      x: px(70),
      y: DEVICE_HEIGHT - px(110),
      w: DEVICE_WIDTH - px(140),
      h: px(50),
      text: "Continue",
      text_size: TYPOGRAPHY.BODY.size,
      color: COLORS.TITLE,
      normal_color: COLORS.PRIMARY,
      press_color: COLORS.PRIMARY_PRESSED,
      radius: px(25),
    },
  },
  NAVIGATION: {
    LEFT_BUTTON: {
      x: px(10),
      y: DEVICE_HEIGHT / 2 - px(25),
      w: px(50),
      h: px(50),
      normal_src: "left_arrow.png",
      press_src: "left_arrow.png",
      radius: px(25),
    },
    LEFT_BUTTON_DISABLED: {
      x: px(10),
      y: DEVICE_HEIGHT / 2 - px(25),
      w: px(50),
      h: px(50),
      normal_src: "left_arrow_disabled.png",
      press_src: "left_arrow_disabled.png",
      radius: px(25),
    },
    RIGHT_BUTTON: {
      x: DEVICE_WIDTH - px(60),
      y: DEVICE_HEIGHT / 2 - px(25),
      w: px(50),
      h: px(50),
      normal_src: "right_arrow.png",
      press_src: "right_arrow.png",
    },
    RIGHT_BUTTON_DISABLED: {
      x: DEVICE_WIDTH - px(60),
      y: DEVICE_HEIGHT / 2 - px(25),
      w: px(50),
      h: px(50),
      normal_src: "right_arrow_disabled.png",
      press_src: "right_arrow_disabled.png",
    },
  },
};

export const UI_BUILDERS = {
  createText: SHARED_UI_BUILDERS.createText,
  createButton: SHARED_UI_BUILDERS.createButton,
  createGroup: SHARED_UI_BUILDERS.createGroup,

  createFillRect: ({
    parentWidget = hmUI,
    layout,
    pageIndex = 0,
    props = {},
  }) => {
    const finalProps = {
      ...layout,
      x: (layout.x || 0) + (pageIndex || 0) * DEVICE_WIDTH,
      ...props,
    };
    return parentWidget.createWidget(hmUI.widget.FILL_RECT, finalProps);
  },

  createImage: ({
    parentWidget = hmUI,
    layout,
    src,
    pageIndex = 0,
    props = {},
  }) => {
    const finalProps = {
      ...layout,
      x: (layout.x || 0) + (pageIndex || 0) * DEVICE_WIDTH,
      src,
      ...props,
    };
    return parentWidget.createWidget(hmUI.widget.IMG, finalProps);
  },
};
