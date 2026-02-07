import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";
import {
    COLORS,
    TYPOGRAPHY,
    DEVICE_WIDTH,
    DEVICE_HEIGHT,
} from "../shared/index.r.layout";

const ICON_SIZE = px(100);
const BUTTON_WIDTH = px(220);
const BUTTON_HEIGHT = px(80);

export const LAYOUT = {
    PRAYER_ICON: {
        x: (DEVICE_WIDTH - ICON_SIZE) / 2,
        y: px(40),
        w: ICON_SIZE,
        h: ICON_SIZE,
    },

    PRAYER_NAME: {
        x: 0,
        y: px(40) + ICON_SIZE + px(16),
        w: DEVICE_WIDTH,
        h: px(50),
        text_size: px(42),
        color: COLORS.TITLE,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
    },

    PRAYER_TIME: {
        x: 0,
        y: px(40) + ICON_SIZE + px(16) + px(50) + px(8),
        w: DEVICE_WIDTH,
        h: px(40),
        text_size: TYPOGRAPHY.TITLE.size,
        color: COLORS.PRIMARY,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
    },

    DISMISS_BUTTON: {
        x: (DEVICE_WIDTH - BUTTON_WIDTH) / 2,
        y: DEVICE_HEIGHT - px(100) - BUTTON_HEIGHT,
        w: BUTTON_WIDTH,
        h: BUTTON_HEIGHT,
        text_size: TYPOGRAPHY.SUBTITLE.size,
        color: COLORS.TITLE,
        normal_color: COLORS.PRIMARY,
        press_color: COLORS.PRIMARY_PRESSED,
        radius: px(40),
    },

    AUTO_DISMISS_TEXT: {
        x: 0,
        y: DEVICE_HEIGHT - px(90),
        w: DEVICE_WIDTH,
        h: px(30),
        text_size: TYPOGRAPHY.BODY_SECONDARY.size,
        color: COLORS.SUBTITLE,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
    },
};
