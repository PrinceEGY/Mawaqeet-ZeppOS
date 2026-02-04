import * as hmUI from "@zos/ui";
import { DateUtils } from "../../../shared/utils/date-utils";
import { BaseWidget, ButtonWidget, TextWidget } from "../../shared/widgets";
import { LAYOUT, UI_BUILDERS } from "../index.r.layout";

export class DatePickerWidget extends BaseWidget {
  constructor({ parentWidget, pageState }) {
    super({ parentWidget, pageState });

    this.datePicker = null;
    this.backgroundRect = null;
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

    this.backgroundRect = UI_BUILDERS.createDatePickerBackground({
      parentWidget: this.widget,
    });

    this._buildButtons();
  }

  onShow() {
    this._buildDatePickerComponents();
    this.backgroundRect?.setProperty(hmUI.prop.VISIBLE, true);
    this.confirmButton?.show();
    this.cancelButton?.show();
  }

  onHide() {
    this._destroyDatePickerComponents();
    this.backgroundRect?.setProperty(hmUI.prop.VISIBLE, false);
    this.confirmButton?.hide();
    this.cancelButton?.hide();
  }

  onDestroy() {
    this.confirmButton?.destroy();
    this.cancelButton?.destroy();

    if (this.backgroundRect) hmUI.deleteWidget(this.backgroundRect);
    if (this.datePicker) hmUI.deleteWidget(this.datePicker);

    this.datePicker = null;
    this.backgroundRect = null;
    this.confirmButton = null;
    this.cancelButton = null;
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

    this.pageState.setCurrentDate(selectedDate);
    this.hide();
  }

  _onCancel() {
    this.hide();
  }
}
