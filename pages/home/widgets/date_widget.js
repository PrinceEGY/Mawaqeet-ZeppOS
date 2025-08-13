import * as hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { DateUtils } from "../../../shared/utils/date-utils";
import { UI_BUILDERS } from "../index.r.layout";

const logger = Logger.getLogger("date-widget");

export class DateWidget {
  constructor(parentContainer, pageState) {
    this.parentContainer = parentContainer;
    this.pageState = pageState;
    this.state = {
      isBuilt: false,
    };
    this.widget = null;
  }

  build() {
    try {
      if (this.state.isBuilt) {
        logger.debug("Widget already built");
        return;
      }

      UI_BUILDERS.createLeftArrow(this.parentContainer, () => {
        this.previousDay();
      });

      UI_BUILDERS.createRightArrow(this.parentContainer, () => {
        this.nextDay();
      });

      const currentDate = this.pageState.getCurrentDate();
      const dateParts = DateUtils.formatGregorianDate(currentDate);
      const dateText = `${dateParts.getDayName()}\n${dateParts.getDateOnly()}`;
      this.widget = UI_BUILDERS.createDateText(this.parentContainer, dateText);

      this.state.isBuilt = true;
    } catch (error) {
      this.handleError("Failed to build date widget", error);
    }
  }

  update() {
    try {
      if (this.state.isBuilt) {
        this.updateView();
      } else {
        this.build();
      }
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
