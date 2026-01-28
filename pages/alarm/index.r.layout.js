import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";
import {
    COLORS,
    TYPOGRAPHY,
    DEVICE_WIDTH,
    DEVICE_HEIGHT,
} from "../shared/index.r.layout";

const BUTTON_WIDTH = px(180);
const BUTTON_HEIGHT = px(56);

export const LAYOUT = {
    PRAYER_NAME: {
        x: 0,
        y: DEVICE_HEIGHT / 2 - px(100),
        w: DEVICE_WIDTH,
        h: px(60),
        text_size: px(42),
        color: COLORS.TITLE,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
    },

    PRAYER_TIME: {
        x: 0,
        y: DEVICE_HEIGHT / 2 - px(40),
        w: DEVICE_WIDTH,
        h: px(50),
        text_size: TYPOGRAPHY.TITLE.size,
        color: COLORS.PRIMARY,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
    },

    DISMISS_BUTTON: {
        x: (DEVICE_WIDTH - BUTTON_WIDTH) / 2,
        y: DEVICE_HEIGHT / 2 + px(40),
        w: BUTTON_WIDTH,
        h: BUTTON_HEIGHT,
        text_size: TYPOGRAPHY.BODY.size,
        color: COLORS.TITLE,
        normal_color: COLORS.PRIMARY,
        press_color: COLORS.PRIMARY_PRESSED,
        radius: px(28),
    },
};
