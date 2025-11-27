import * as hmUI from "@zos/ui";
import { DateUtils } from "../../../shared/utils/date-utils";
import { BaseWidget, ButtonWidget, TextWidget } from "../../shared/widgets";
import { LAYOUT, UI_BUILDERS } from "../index.r.layout";
import { DatePickerWidget } from "./date_picker_widget";

export class DateWidget extends BaseWidget {
  constructor({ parentWidget, pageState }) {
    super({ parentWidget, pageState });

    this.datePicker = null;
    this.leftArrowButton = null;
    this.rightArrowButton = null;
    this.dateTextWidget = null;
    this.dateTextClickHandler = null;

    this._onDateChanged = this._onDateChanged.bind(this);
  }

  onBuild() {
    this.widget = UI_BUILDERS.createGroup({
      parentWidget: this.parentWidget,
      layout: LAYOUT.DATE_NAVIGATION.CONTAINER,
    });

    this.datePicker = new DatePickerWidget({ pageState: this.pageState });
    this.datePicker.build();
    this.datePicker.hide();

    this.leftArrowButton = new ButtonWidget({
      parentWidget: this.widget,
      pageState: this.pageState,
      layout: LAYOUT.DATE_NAVIGATION.LEFT_ARROW,
      clickHandler: () => this._changeDay(-1),
    });
    this.leftArrowButton.build();

    this.rightArrowButton = new ButtonWidget({
      parentWidget: this.widget,
      pageState: this.pageState,
      layout: LAYOUT.DATE_NAVIGATION.RIGHT_ARROW,
      clickHandler: () => this._changeDay(1),
    });
    this.rightArrowButton.build();

    this.dateTextWidget = new TextWidget({
      parentWidget: this.widget,
      pageState: this.pageState,
      text: "",
      layout: LAYOUT.DATE_NAVIGATION.DATE_TEXT,
    });
    this.dateTextWidget.build();

    this.dateTextClickHandler = () => {
      this.datePicker.show();
    };
    this.dateTextWidget.widget.addEventListener(
      hmUI.event.CLICK_UP,
      this.dateTextClickHandler
    );

    this.pageState.on("dateChanged", this._onDateChanged);
  }

  onUpdateView() {
    const currentDate = this.pageState.getCurrentDate();
    const dateParts = DateUtils.formatGregorianDate(currentDate);
    const dateText = `${dateParts.getDayName()}\n${dateParts.getDateOnly()}`;

    this.dateTextWidget.update({ text: dateText });
  }

  onDestroy() {
    this.pageState.off("dateChanged", this._onDateChanged);

    if (this.dateTextWidget?.widget && this.dateTextClickHandler) {
      this.dateTextWidget.widget.removeEventListener(
        hmUI.event.CLICK_UP,
        this.dateTextClickHandler
      );
      this.dateTextClickHandler = null;
    }

    this.datePicker?.destroy();
    this.datePicker = null;

    this.dateTextWidget?.destroy();
    this.dateTextWidget = null;

    this.leftArrowButton?.destroy();
    this.leftArrowButton = null;

    this.rightArrowButton?.destroy();
    this.rightArrowButton = null;
  }

  previousDay() {
    this._changeDay(-1);
  }

  nextDay() {
    this._changeDay(1);
  }

  _changeDay(offset) {
    const currentDate = this.pageState.getCurrentDate();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    this.pageState.setCurrentDate(newDate);
  }

  _onDateChanged() {
    this.updateView();
  }
}
