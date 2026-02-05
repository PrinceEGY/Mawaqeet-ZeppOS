import { getDeviceInfo } from "@zos/device";
import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

/**
 * Unified color palette for the entire device app
 */
export const COLORS = {
  // Primary app color
  PRIMARY: 0x399e5a,
  PRIMARY_PRESSED: 0x2d7e48,

  // Warning/Error colors
  ERROR: 0xe54f03,
  ERROR_PRESSED: 0xb83f02,

  // Text colors
  TITLE: 0xffffff, // White - for titles and main text
  SUBTITLE: 0xb8b8b8, // Light grey - for subtitles and descriptions
  BODY: 0x7f7f7f, // Medium grey - for secondary information

  // Link/Button colors
  LINK: 0x059af7,
  LINK_PRESSED: 0x047ac4,
};

/**
 * Typography sizes for consistent text styling
 * Line height defines the vertical space the text occupies.
 * Padding = (lineHeight - size) / 2 — minimum spacing above/below text.
 */
export const TYPOGRAPHY = {
  TITLE: { size: 32, lineHeight: 40 },
  SUBTITLE: { size: 28, lineHeight: 35 },
  BODY: { size: 24, lineHeight: 30 },
  BODY_SECONDARY: { size: 20, lineHeight: 25 },
};

export const LAYOUT = {
  SYNC_INDICATOR: {
    x: (DEVICE_WIDTH - px(100)) / 2,
    y: px(45),
    w: px(100),
    h: px(50),
    text: "Sync",
    text_size: TYPOGRAPHY.BODY_SECONDARY.size,
    color: COLORS.TITLE,
    normal_color: COLORS.PRIMARY,
    press_color: COLORS.PRIMARY_PRESSED,
    radius: px(8),
  },
};

export const SHARED_UI_BUILDERS = {
  createText: ({
    parentWidget = hmUI,
    layout,
    text,
    pageIndex = 0,
    props = {},
  }) => {
    const finalProps = {
      ...layout,
      x: layout.x + (pageIndex || 0) * DEVICE_WIDTH,
      text,
      ...props,
    };

    return parentWidget.createWidget(hmUI.widget.TEXT, finalProps);
  },

  createButton: ({
    parentWidget = hmUI,
    layout,
    text,
    pageIndex = 0,
    props = {},
  }) => {
    const finalProps = {
      ...layout,
      x: layout.x + (pageIndex || 0) * DEVICE_WIDTH,
      text,
      ...props,
    };

    return parentWidget.createWidget(hmUI.widget.BUTTON, finalProps);
  },

  createSpacer: ({
    parentWidget = hmUI,
    yOffset,
    height = px(20),
    pageIndex = 0,
  }) => {
    return parentWidget.createWidget(hmUI.widget.TEXT, {
      x: 0 + (pageIndex || 0) * DEVICE_WIDTH,
      y: yOffset,
      w: px(10),
      h: height,
    });
  },

  createGroup: ({ parentWidget = hmUI, layout, pageIndex = 0, props = {} }) => {
    const finalProps = {
      ...layout,
      x: (layout.x || 0) + (pageIndex || 0) * DEVICE_WIDTH,
      ...props,
    };

    return parentWidget.createWidget(hmUI.widget.GROUP, finalProps);
  },

  createViewContainer: ({
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

    return parentWidget.createWidget(hmUI.widget.VIEW_CONTAINER, finalProps);
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
