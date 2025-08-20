import * as hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { DateUtils } from "../../../shared/utils/date-utils";
import { LAYOUT, UI_BUILDERS } from "../index.r.layout";

const logger = Logger.getLogger("time-widget");

export class TimeWidget {
  constructor({ parentWidget, pageState }) {
    this.parentWidget = parentWidget;
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

      const currentTime = DateUtils.formatCurrentTime();
      this.widget = UI_BUILDERS.createText({
        parentWidget: this.parentWidget,
        layout: LAYOUT.DATE_NAVIGATION.TIME_TEXT,
        text: currentTime,
      });

      this.state.isBuilt = true;
    } catch (error) {
      this.handleError("Failed to build time widget", error);
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
      this.handleError("Failed to update time widget", error);
    }
  }

  updateView() {
    if (!this.widget) return;

    const currentTime = DateUtils.formatCurrentTime();
    this.widget.setProperty(hmUI.prop.TEXT, currentTime);
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
      this.handleError("Failed to destroy time widget", error);
    }
  }
}
