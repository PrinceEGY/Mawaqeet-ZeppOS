import * as hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { DateUtils } from "../../../shared/utils/date-utils";
import { LAYOUT, UI_BUILDERS } from "../index.r.layout";
import { DatePickerWidget } from "./date_picker_widget";

const logger = Logger.getLogger("date-widget");

export class DateWidget {
  constructor({ parentWidget, pageState }) {
    this.parentWidget = parentWidget;
    this.pageState = pageState;
    this.state = {
      isBuilt: false,
    };
    this.widget = null;
    this.datePicker = null;

    this.pageState.on("dateChanged", this.update.bind(this));
  }

  build() {
    try {
      if (this.state.isBuilt) {
        logger.debug("Widget already built");
        return;
      }

      this.datePicker = new DatePickerWidget({
        parentWidget: this.parentWidget,
        pageState: this.pageState,
      });

      UI_BUILDERS.createLeftArrow({
        parentWidget: this.parentWidget,
        clickHandler: () => {
          this.previousDay();
        },
      });

      UI_BUILDERS.createRightArrow({
        parentWidget: this.parentWidget,
        clickHandler: () => {
          this.nextDay();
        },
      });

      const currentDate = this.pageState.getCurrentDate();
      const dateParts = DateUtils.formatGregorianDate(currentDate);
      const dateText = `${dateParts.getDayName()}\n${dateParts.getDateOnly()}`;
      this.widget = UI_BUILDERS.createText({
        parentWidget: this.parentWidget,
        layout: LAYOUT.DATE_NAVIGATION.DATE_TEXT,
        text: dateText,
      });

      this.widget.addEventListener(hmUI.event.CLICK_UP, () => {
        this.showDatePicker();
      });

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

  showDatePicker() {
    try {
      this.datePicker.show();
    } catch (error) {
      this.handleError("Failed to show date picker", error);
    }
  }

  updateView() {
    if (!this.widget) return;

    const currentDate = this.pageState.getCurrentDate();
    const dateParts = DateUtils.formatGregorianDate(currentDate);
    const dateText = `${dateParts.getDayName()}\n${dateParts.getDateOnly()}`;
    this.widget.setProperty(hmUI.prop.TEXT, dateText);
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

      if (this.widget) {
        hmUI.deleteWidget(this.widget);
      }
      this.widget = null;
      this.state.isBuilt = false;
    } catch (error) {
      this.handleError("Failed to destroy date widget", error);
    }
  }
}
