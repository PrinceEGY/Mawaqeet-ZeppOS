import { getDeviceInfo } from "@zos/device";
import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";
import { COLORS, TYPOGRAPHY } from "../shared/index.r.layout";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

export const LAYOUT = {
  ICON: {
    x: (DEVICE_WIDTH - px(160)) / 2,
    y: (DEVICE_HEIGHT - px(160)) / 2 - px(50),
    w: px(160),
    h: px(160),
  },
  TITLE: {
    x: px(30),
    y: (DEVICE_HEIGHT - px(160)) / 2 + px(130),
    w: DEVICE_WIDTH - px(60),
    h: TYPOGRAPHY.SUBTITLE.lineHeight,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_size: TYPOGRAPHY.SUBTITLE.size,
    color: COLORS.TITLE,
  },
  REASON: {
    x: px(30),
    y: (DEVICE_HEIGHT - px(160)) / 2 + px(175),
    w: DEVICE_WIDTH - px(60),
    h: px(80),
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_size: TYPOGRAPHY.BODY_SECONDARY.size,
    color: COLORS.SUBTITLE,
    text_style: hmUI.text_style.WRAP,
  },
};
