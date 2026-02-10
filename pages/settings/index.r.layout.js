import { px } from "@zos/utils";
import { DEVICE_WIDTH, TYPOGRAPHY, COLORS } from "../shared/index.r.layout";
import * as hmUI from "@zos/ui";

export const LAYOUT = {
    TITLE: {
        x: px(0),
        y: px(40),
        w: DEVICE_WIDTH,
        h: TYPOGRAPHY.TITLE.lineHeight,
        text: "Settings",
        text_size: TYPOGRAPHY.TITLE.size,
        color: COLORS.TITLE,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
    },
};
