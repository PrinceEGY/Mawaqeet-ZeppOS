import { px } from "@zos/utils";
import { COLORS, TYPOGRAPHY } from "../../shared/index.r.layout";
import { BaseWidget, ImageWidget, TextWidget } from "../../shared/widgets";
import { LAYOUT } from "../index.r.layout";

const STATUS_SYMBOLS = {
  valid: "✓",
  invalid: "X",
};

export class RequirementsWidget extends BaseWidget {
  constructor({ parentWidget, pageState, pageIndex = 0 }) {
    super({ parentWidget, pageState });
    this.pageIndex = pageIndex;
    this.statusImageWidget = null;
    this.titleWidget = null;
    this.locationWidget = null;

    this.onSettingsValidation = this.onSettingsValidation.bind(this);
  }

  onBuild() {
    this.statusImageWidget = new ImageWidget({
      parentWidget: this.parentWidget,
      pageState: this.pageState,
      src: "watch_sync.png",
      layout: LAYOUT.STATUS.STATUS_IMAGE,
      pageIndex: this.pageIndex,
    });
    this.statusImageWidget.build();

    this.titleWidget = new TextWidget({
      parentWidget: this.parentWidget,
      pageState: this.pageState,
      text: "Required Fields",
      layout: LAYOUT.STATUS.REQUIREMENTS_TITLE,
      pageIndex: this.pageIndex,
    });
    this.titleWidget.build();

    this.locationWidget = new TextWidget({
      parentWidget: this.parentWidget,
      pageState: this.pageState,
      text: "",
      layout: LAYOUT.STATUS.REQUIREMENT_ITEM,
      pageIndex: this.pageIndex,
      y: px(290),
    });
    this.locationWidget.build();



    this.pageState.on("settingsValidation", this.onSettingsValidation);
  }

  onUpdateView() {
    const requirements = this.pageState.requirementsStatus;
    if (!requirements) return;

    const { location } = requirements;

    const locSymbol = location.isValid
      ? STATUS_SYMBOLS.valid
      : STATUS_SYMBOLS.invalid;
    const locColor = location.isValid ? COLORS.PRIMARY : COLORS.ERROR;
    const locText = location.isValid ? location.message : "Not set";
    this.locationWidget?.update({
      text: `${locSymbol} Location: ${locText}`,
      color: locColor,
    });
  }

  onShow() {
    this.statusImageWidget?.show();
    this.titleWidget?.show();
    this.locationWidget?.show();

  }

  onHide() {
    this.statusImageWidget?.hide();
    this.titleWidget?.hide();
    this.locationWidget?.hide();

  }

  onDestroy() {
    this.pageState.off("settingsValidation", this.onSettingsValidation);
    this.statusImageWidget?.destroy();
    this.titleWidget?.destroy();
    this.locationWidget?.destroy();
    this.statusImageWidget = null;
    this.titleWidget = null;
    this.locationWidget = null;

  }

  onSettingsValidation() {
    this.updateView();
  }
}
