import * as hmUI from "@zos/ui";
import { DateUtils } from "../../../shared/utils/date-utils";
import { BaseWidget } from "../../shared/widgets";
import { LAYOUT, UI_BUILDERS } from "../index.r.layout";

export class NoDataWidget extends BaseWidget {
  constructor({ parentWidget, pageState }) {
    super({ parentWidget, pageState });

    this.titleWidget = null;
    this.rangeWidget = null;
  }

  onBuild() {
    this.widget = UI_BUILDERS.createViewContainer({
      parentWidget: this.parentWidget,
      layout: LAYOUT.PRAYERS_CONTAINER,
    });

    this.titleWidget = UI_BUILDERS.createText({
      parentWidget: this.widget,
      layout: LAYOUT.NO_DATA.TITLE,
      text: "No data for this date",
    });

    this.rangeWidget = UI_BUILDERS.createText({
      parentWidget: this.widget,
      layout: LAYOUT.NO_DATA.RANGE,
      text: this._getRangeText(),
    });
  }

  onUpdateView() {
    if (this.rangeWidget) {
      this.rangeWidget.setProperty(hmUI.prop.MORE, {
        ...LAYOUT.NO_DATA.RANGE,
        text: this._getRangeText(),
      });
    }
  }

  onDestroy() {
    if (this.titleWidget) {
      hmUI.deleteWidget(this.titleWidget);
      this.titleWidget = null;
    }
    if (this.rangeWidget) {
      hmUI.deleteWidget(this.rangeWidget);
      this.rangeWidget = null;
    }
  }

  _getRangeText() {
    const range = this.pageState.getAvailableDateRange();
    if (!range) {
      return "No data available";
    }

    const startStr = DateUtils.formatGregorianDate(
      range.startDate
    ).getDateOnly();
    const endStr = DateUtils.formatGregorianDate(range.endDate).getDateOnly();
    return `Available:\n${startStr} - ${endStr}`;
  }
}
