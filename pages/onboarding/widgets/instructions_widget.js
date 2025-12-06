import { px } from "@zos/utils";
import { TYPOGRAPHY } from "../../shared/index.r.layout";
import { ImageWidget, TextWidget } from "../../shared/widgets";
import { BaseWidget } from "../../shared/widgets/base_widget";
import { LAYOUT } from "../index.r.layout";

const STEPS = [
  "1. Open Zepp app on phone",
  "2. Go to Device → App Settings",
  "3. Find and open 'Mawaqeet' app",
  "4. Configure location & preferences",
  "5. Check sync status on next screen",
];
const NOTE_TEXT = "Settings can be changed anytime";
const STEP_HEIGHT = TYPOGRAPHY.BODY_SECONDARY.lineHeight;
const STEPS_START_Y = px(225);

export class InstructionsWidget extends BaseWidget {
  constructor({ parentWidget, pageState, pageIndex = 0 }) {
    super({ parentWidget, pageState });
    this.pageIndex = pageIndex;
    this.connectionImageWidget = null;
    this.titleWidget = null;
    this.stepWidgets = [];
    this.noteWidget = null;
  }

  onBuild() {
    this.connectionImageWidget = new ImageWidget({
      parentWidget: this.parentWidget,
      pageState: this.pageState,
      src: "zepp_app_icon.png",
      layout: LAYOUT.SETUP.CONNECTION_IMAGE,
      pageIndex: this.pageIndex,
    });
    this.connectionImageWidget.build();

    this.titleWidget = new TextWidget({
      parentWidget: this.parentWidget,
      pageState: this.pageState,
      text: "Setup Instructions",
      layout: LAYOUT.SETUP.INSTRUCTION_TITLE,
      pageIndex: this.pageIndex,
    });
    this.titleWidget.build();

    let yOffset = STEPS_START_Y;
    STEPS.forEach((step) => {
      const widget = new TextWidget({
        parentWidget: this.parentWidget,
        pageState: this.pageState,
        text: step,
        layout: LAYOUT.SETUP.INSTRUCTION_STEP,
        pageIndex: this.pageIndex,
        y: yOffset,
      });
      widget.build();
      this.stepWidgets.push(widget);
      yOffset += STEP_HEIGHT;
    });

    this.noteWidget = new TextWidget({
      parentWidget: this.parentWidget,
      pageState: this.pageState,
      text: NOTE_TEXT,
      layout: LAYOUT.SETUP.INSTRUCTION_NOTE,
      pageIndex: this.pageIndex,
      y: yOffset + px(10),
    });
    this.noteWidget.build();
  }

  onShow() {
    this.connectionImageWidget?.show();
    this.titleWidget?.show();
    this.stepWidgets.forEach((w) => w.show());
    this.noteWidget?.show();
  }

  onHide() {
    this.connectionImageWidget?.hide();
    this.titleWidget?.hide();
    this.stepWidgets.forEach((w) => w.hide());
    this.noteWidget?.hide();
  }

  onDestroy() {
    this.connectionImageWidget?.destroy();
    this.titleWidget?.destroy();
    this.stepWidgets.forEach((w) => w.destroy());
    this.noteWidget?.destroy();
    this.connectionImageWidget = null;
    this.titleWidget = null;
    this.stepWidgets = [];
    this.noteWidget = null;
  }
}
