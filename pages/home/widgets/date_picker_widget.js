import * as hmUI from "@zos/ui";
import { DateUtils } from "../../../shared/utils/date-utils";
import { BaseWidget, ButtonWidget, TextWidget } from "../../shared/widgets";
import { PrayersService } from "../../utils/prayers-service";
import { LAYOUT, UI_BUILDERS } from "../index.r.layout";

export class DatePickerWidget extends BaseWidget {
  constructor({ parentWidget, pageState }) {
    super({ parentWidget, pageState });

    this.datePicker = null;
    this.backgroundRect = null;
    this.hintText = null;
    this.confirmButton = null;
    this.cancelButton = null;

    this._onConfirm = this._onConfirm.bind(this);
    this._onCancel = this._onCancel.bind(this);
  }

  onBuild() {
    this.widget = UI_BUILDERS.createViewContainer({
      parentWidget: this.parentWidget,
      layout: LAYOUT.DATE_PICKER.CONTAINER,
    });

    this.dateRange = PrayersService.getEffectiveAvailableDateRange();

    this.backgroundRect = UI_BUILDERS.createDatePickerBackground({
      parentWidget: this.widget,
    });

    this._buildHintText();
    this._buildButtons();
  }

  onShow() {
    if (!this.dateRange) {
      hmUI.showToast({ text: "No prayer data available." });
      return;
    }

    this._buildDatePickerComponents();
    this.backgroundRect?.setProperty(hmUI.prop.VISIBLE, true);
    this.hintText?.show();
    this.confirmButton?.show();
    this.cancelButton?.show();
  }

  onHide() {
    this._destroyDatePickerComponents();
    this.backgroundRect?.setProperty(hmUI.prop.VISIBLE, false);
    this.hintText?.hide();
    this.confirmButton?.hide();
    this.cancelButton?.hide();
  }

  onUpdate({ dateRange, currentDate } = {}) {
    if (dateRange !== undefined) this.dateRange = dateRange;
    else this.dateRange = PrayersService.getEffectiveAvailableDateRange();
  }

  onUpdateView() {
    const text =
      this.dateRange?.startDate && this.dateRange?.endDate
        ? `Available: ${DateUtils.dateToDateString(
            this.dateRange.startDate,
            "/"
          )} - ${DateUtils.dateToDateString(this.dateRange.endDate, "/")}`
        : "";
    this.hintText?.update({ text });
  }

  onDestroy() {
    this.hintText?.destroy();
    this.confirmButton?.destroy();
    this.cancelButton?.destroy();

    if (this.backgroundRect) hmUI.deleteWidget(this.backgroundRect);
    if (this.datePicker) hmUI.deleteWidget(this.datePicker);

    this.datePicker = null;
    this.backgroundRect = null;
    this.hintText = null;
    this.confirmButton = null;
    this.cancelButton = null;
  }

  _buildHintText() {
    const text =
      this.dateRange?.startDate && this.dateRange?.endDate
        ? `Available: ${DateUtils.dateToDateString(
            this.dateRange.startDate,
            "/"
          )} - ${DateUtils.dateToDateString(this.dateRange.endDate, "/")}`
        : "";

    this.hintText = new TextWidget({
      parentWidget: this.widget,
      pageState: this.pageState,
      layout: LAYOUT.DATE_PICKER.HINT_TEXT,
      text,
    });
    this.hintText.build();
  }

  _buildButtons() {
    this.confirmButton = new ButtonWidget({
      parentWidget: this.widget,
      pageState: this.pageState,
      layout: LAYOUT.DATE_PICKER.CONFIRM_BUTTON,
      clickHandler: this._onConfirm,
    });
    this.confirmButton.build();

    this.cancelButton = new ButtonWidget({
      parentWidget: this.widget,
      pageState: this.pageState,
      layout: LAYOUT.DATE_PICKER.CANCEL_BUTTON,
      clickHandler: this._onCancel,
    });
    this.cancelButton.build();
  }

  _buildDatePickerComponents() {
    this._destroyDatePickerComponents();

    const currentDate = this.pageState.getCurrentDate();
    this.datePicker = UI_BUILDERS.createDatePicker({
      parentWidget: this.widget,
      currentDate,
      dateRange: this.dateRange,
    });
  }

  _destroyDatePickerComponents() {
    if (this.datePicker) {
      hmUI.deleteWidget(this.datePicker);
      this.datePicker = null;
    }
  }

  _onConfirm() {
    const dateObj = this.datePicker.getProperty(hmUI.prop.MORE, {});
    const { year, month, day } = dateObj;
    const selectedDate = new Date(year, month - 1, day);

    if (!PrayersService.isDateInValidRange(selectedDate)) {
      hmUI.showToast({
        text: "Selected date is outside the available prayer times.",
      });
      return;
    }

    this.pageState.setCurrentDate(selectedDate);
    this.hide();
  }

  _onCancel() {
    this.hide();
  }
}
