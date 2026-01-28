import { px } from "@zos/utils";
import { align } from "@zos/ui";
import { COLORS, DEVICE_HEIGHT, DEVICE_WIDTH, TYPOGRAPHY } from "../shared/index.r.layout";

const BUTTON_WIDTH = px(180);
const BUTTON_HEIGHT = px(45);
const BUTTON_SPACING = px(10);
const START_Y = px(70);

export const LAYOUT = {
    TITLE: {
        x: px(0),
        y: px(25),
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
        text_size: TYPOGRAPHY.BODY.size,
        color: COLORS.TITLE,
        normal_color: COLORS.PRIMARY,
        press_color: COLORS.PRIMARY_PRESSED,
        radius: px(12),
    },

    // Helper to calculate Y position for each button index
    getButtonY: (index) => START_Y + index * (BUTTON_HEIGHT + BUTTON_SPACING),

    // Scrollable container for buttons
    SCROLL_LIST: {
        x: px(0),
        y: START_Y,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT - START_Y - px(20),
        item_space: BUTTON_SPACING,
        item_config: [
            {
                type_id: 1,
                item_height: BUTTON_HEIGHT,
            },
        ],
    },
};
