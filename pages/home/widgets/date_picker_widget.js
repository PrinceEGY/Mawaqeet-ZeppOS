import * as hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { UI_BUILDERS } from "../index.r.layout";

const logger = Logger.getLogger("date-picker-widget");

export class DatePickerWidget {
  constructor({ parentWidget, pageState }) {
    this.parentWidget = parentWidget;
    this.pageState = pageState;
    this.state = {
      isBuilt: false,
      isVisible: false,
    };
    this.widgets = {
      container: null,
      datePicker: null,
      hint: null,
      confirmButton: null,
      cancelButton: null,
    };
  }

  build() {
    try {
      if (this.state.isBuilt) {
        return;
      }

      const currentDate = this.pageState.getCurrentDate();
      const fetchMetaData = this.pageState.storage.getItem("fetchMetaData");
      const dateRange = this.getAvailableDateRange(fetchMetaData);

      this.widgets = UI_BUILDERS.createDatePickerUI({
        currentDate,
        dateRange,
        onConfirm: this.onConfirm.bind(this),
        onCancel: this.onCancel.bind(this),
      });

      this.widgets.container.setProperty(hmUI.prop.VISIBLE, false);
      this.widgets.datePicker.setProperty(hmUI.prop.VISIBLE, false);

      this.state.isBuilt = true;
    } catch (error) {
      this.handleError("Failed to build date picker", error);
    }
  }

  show() {
    try {
      if (!this.state.isBuilt) {
        this.build();
      }

      if (!this.state.isVisible && this.widgets.container) {
        this.widgets.container.setProperty(hmUI.prop.VISIBLE, true);
        this.widgets.datePicker.setProperty(hmUI.prop.VISIBLE, true);
        this.state.isVisible = true;
      }
    } catch (error) {
      this.handleError("Failed to show date picker", error);
    }
  }

  hide() {
    try {
      if (this.widgets.container) {
        this.widgets.container.setProperty(hmUI.prop.VISIBLE, false);
        this.widgets.datePicker.setProperty(hmUI.prop.VISIBLE, false);
        this.state.isVisible = false;
      }
    } catch (error) {
      this.handleError("Failed to hide date picker", error);
    }
  }

  getAvailableDateRange(fetchMetaData) {
    try {
      if (
        !fetchMetaData ||
        !fetchMetaData.startDate ||
        !fetchMetaData.endDate
      ) {
        const currentYear = new Date().getFullYear();
        return {
          startYear: currentYear - 1,
          endYear: currentYear + 1,
        };
      }

      const startDate = new Date(fetchMetaData.startDate);
      const endDate = new Date(fetchMetaData.endDate);

      return {
        startYear: startDate.getFullYear(),
        endYear: endDate.getFullYear(),
        startDate: startDate,
        endDate: endDate,
      };
    } catch (error) {
      this.handleError("Failed to get available date range", error);
      const currentYear = new Date().getFullYear();
      return {
        startYear: currentYear - 1,
        endYear: currentYear + 1,
      };
    }
  }

  onConfirm() {
    try {
      const dateObj = this.widgets.datePicker.getProperty(hmUI.prop.MORE, {});
      const { year, month, day } = dateObj;

      const selectedDate = new Date(year, month - 1, day);

      if (this.isDateInRange(selectedDate)) {
        this.pageState.setCurrentDate(selectedDate);
      } else {
        logger.debug("Selected date is outside available range");
        hmUI.showToast({
          text: "Selected date is outside the available prayer times.",
        });
        return;
      }

      this.hide();
    } catch (error) {
      this.handleError("Failed to confirm date selection", error);
      this.hide();
    }
  }

  onCancel() {
    try {
      this.hide();
    } catch (error) {
      this.handleError("Failed to cancel date picker", error);
    }
  }

  isDateInRange(selectedDate) {
    try {
      const fetchMetaData = this.pageState.storage.getItem("fetchMetaData");

      if (
        !fetchMetaData ||
        !fetchMetaData.startDate ||
        !fetchMetaData.endDate
      ) {
        return true;
      }

      const startDate = new Date(fetchMetaData.startDate);
      const endDate = new Date(fetchMetaData.endDate);

      return selectedDate >= startDate && selectedDate <= endDate;
    } catch (error) {
      this.handleError("Failed to validate date range", error);
      return true;
    }
  }

  handleError(message, error) {
    logger.error(`${message}: ${error}`);
  }

  destroy() {
    try {
      Object.values(this.widgets).forEach((widget) => {
        if (widget) {
          hmUI.deleteWidget(widget);
        }
      });

      this.widgets = {
        container: null,
        datePicker: null,
        hint: null,
        confirmButton: null,
        cancelButton: null,
      };

      this.state.isBuilt = false;
      this.state.isVisible = false;

      logger.debug("Date picker destroyed");
    } catch (error) {
      this.handleError("Failed to destroy date picker", error);
    }
  }
}
