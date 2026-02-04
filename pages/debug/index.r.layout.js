import { px } from "@zos/utils";
import { align } from "@zos/ui";
import { COLORS, DEVICE_HEIGHT, DEVICE_WIDTH, TYPOGRAPHY } from "../shared/index.r.layout";

const BUTTON_WIDTH = px(220);
const BUTTON_HEIGHT = px(80);
const BUTTON_SPACING = px(20);
const START_Y = px(80);

export const LAYOUT = {
    TITLE: {
        x: px(0),
        y: px(30),
        w: DEVICE_WIDTH,
        h: px(40),
        text_size: TYPOGRAPHY.TITLE.size,
        color: COLORS.TITLE,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
    },

    DEBUG_BUTTON: {
        x: (DEVICE_WIDTH - BUTTON_WIDTH) / 2,
        w: BUTTON_WIDTH,
        h: BUTTON_HEIGHT,
        text_size: TYPOGRAPHY.SUBTITLE.size,
        color: COLORS.TITLE,
        normal_color: COLORS.PRIMARY,
        press_color: COLORS.PRIMARY_PRESSED,
        radius: px(12),
    },

    CONTAINER: {
        x: px(0),
        y: START_Y,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT - START_Y,
    },

    getButtonY: (index) => index * (BUTTON_HEIGHT + BUTTON_SPACING),

    COUNT_TEXT: {
        x: px(0),
        y: px(400),
        w: DEVICE_WIDTH,
        h: px(40),
        color: COLORS.TITLE,
        align_h: align.CENTER_H,
        text_size: TYPOGRAPHY.BODY_SECONDARY.size,
    },



    LAST_SCHEDULED_TEXT: {
        x: px(0),
        y: px(480),
        w: DEVICE_WIDTH,
        h: px(40),
        color: COLORS.SUBTITLE,
        align_h: align.CENTER_H,
        text_size: TYPOGRAPHY.BODY_SECONDARY.size,
    },

    LAST_KEY_TEXT: {
        x: px(0),
        y: px(520),
        w: DEVICE_WIDTH,
        h: px(40),
        color: COLORS.BODY,
        align_h: align.CENTER_H,
        text_size: TYPOGRAPHY.BODY_SECONDARY.size,
    },
};
