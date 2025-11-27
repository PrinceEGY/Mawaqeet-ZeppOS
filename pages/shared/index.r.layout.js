import { getDeviceInfo } from "@zos/device";
import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

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
};
