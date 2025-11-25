import * as hmUI from "@zos/ui";
import { DateUtils } from "../../../shared/utils/date-utils";
import { ButtonWidget, TextWidget } from "../../shared/widgets";
import { DeviceLogger } from "../../utils/device-logger";
import { LAYOUT, UI_BUILDERS } from "../index.r.layout";
import { DatePickerWidget } from "./date_picker_widget";

const logger = new DeviceLogger("date-widget");

export class DateWidget {
  constructor({ parentWidget, pageState }) {
    this.parentWidget = parentWidget;
    this.pageState = pageState;
    this.state = {
      isBuilt: false,
    };
    this.widget = null;

    this.datePicker = new DatePickerWidget({
      pageState: this.pageState,
    });

    this.leftArrowButton = new ButtonWidget({
      pageState,
      layout: LAYOUT.DATE_NAVIGATION.LEFT_ARROW,
      clickHandler: () => {
        this.previousDay();
      },
    });

    this.rightArrowButton = new ButtonWidget({
      pageState,
      layout: LAYOUT.DATE_NAVIGATION.RIGHT_ARROW,
      clickHandler: () => {
        this.nextDay();
      },
    });

    this.dateTextWidget = new TextWidget({
      pageState,
      text: "",
      layout: LAYOUT.DATE_NAVIGATION.DATE_TEXT,
    });

    this.pageState.on("dateChanged", this.update.bind(this));
  }

  build() {
    try {
      if (this.state.isBuilt) {
        logger.debug("Widget already built");
        return;
      }

      this.widget = UI_BUILDERS.createDateContainer({
        parentWidget: this.parentWidget,
      });

      this.leftArrowButton.parentWidget = this.widget;
      this.leftArrowButton.build();

      this.rightArrowButton.parentWidget = this.widget;
      this.rightArrowButton.build();

      this.buildDateTextWidget();

      this.state.isBuilt = true;
    } catch (error) {
      this.handleError("Failed to build date widget", error);
    }
  }

  update() {
    try {
      if (!this.state.isBuilt) {
        this.build();
      }
      this.updateView();
    } catch (error) {
      this.handleError("Failed to update date widget", error);
    }
  }

  previousDay() {
    const currentDate = this.pageState.getCurrentDate();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    this.changeDate(newDate);
  }

  nextDay() {
    const currentDate = this.pageState.getCurrentDate();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    this.changeDate(newDate);
  }

  changeDate(newDate) {
    this.pageState.setCurrentDate(newDate);
  }

  buildDateTextWidget() {
    const currentDate = this.pageState.getCurrentDate();
    const dateParts = DateUtils.formatGregorianDate(currentDate);
    const dateText = `${dateParts.getDayName()}\n${dateParts.getDateOnly()}`;

    this.dateTextWidget.text = dateText;
    this.dateTextWidget.parentWidget = this.widget;
    this.dateTextWidget.build();

    this.dateTextWidget.widget.addEventListener(hmUI.event.CLICK_UP, () => {
      this.showDatePicker();
    });
  }

  showDatePicker() {
    try {
      this.datePicker.show();
    } catch (error) {
      this.handleError("Failed to show date picker", error);
    }
  }

  updateView() {
    if (!this.dateTextWidget) return;

    const currentDate = this.pageState.getCurrentDate();
    const dateParts = DateUtils.formatGregorianDate(currentDate);
    const dateText = `${dateParts.getDayName()}\n${dateParts.getDateOnly()}`;

    this.dateTextWidget.update({ text: dateText });
  }

  handleError(message, error) {
    logger.error(`${message}: ${error}`);
  }

  destroy() {
    try {
      if (this.datePicker) {
        this.datePicker.destroy();
        this.datePicker = null;
      }

      if (this.dateTextWidget) {
        this.dateTextWidget.destroy();
        this.dateTextWidget = null;
      }

      if (this.leftArrowButton) {
        this.leftArrowButton.destroy();
        this.leftArrowButton = null;
      }

      if (this.rightArrowButton) {
        this.rightArrowButton.destroy();
        this.rightArrowButton = null;
      }

      if (this.widget) {
        hmUI.deleteWidget(this.widget);
        this.widget = null;
      }

      this.state.isBuilt = false;
    } catch (error) {
      this.handleError("Failed to destroy date widget", error);
    }
  }
}
