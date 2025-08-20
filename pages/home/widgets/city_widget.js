import * as hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { LAYOUT, UI_BUILDERS } from "../index.r.layout";

const logger = Logger.getLogger("city-widget");

export class CityWidget {
  constructor({ parentWidget, pageState }) {
    this.parentWidget = parentWidget;
    this.pageState = pageState;
    this.state = {
      isBuilt: false,
    };
    this.widget = null;

    this.pageState.on("locationChanged", this.update.bind(this));
  }

  build() {
    try {
      if (this.state.isBuilt) {
        logger.debug("Widget already built");
        return;
      }

      const currentLocation = this.pageState.getCurrentLocation();
      this.widget = UI_BUILDERS.createText({
        parentWidget: this.parentWidget,
        layout: LAYOUT.CITY_TEXT,
        text: currentLocation["city"],
      });

      this.state.isBuilt = true;
    } catch (error) {
      this.handleError("Failed to build city widget", error);
    }
  }

  update() {
    try {
      if (!this.state.isBuilt) {
        this.build();
      }

      this.updateView();
    } catch (error) {
      this.handleError("Failed to update city widget", error);
    }
  }

  updateView() {
    if (!this.widget) return;

    const currentLocation = this.pageState.getCurrentLocation();
    const cityText = currentLocation["city"];

    this.widget.setProperty(hmUI.prop.TEXT, cityText);
  }

  handleError(message, error) {
    logger.error(`${message}: ${error}`);
  }

  destroy() {
    try {
      this.pageState.off("locationChanged", this.update.bind(this));
      if (this.widget) {
        hmUI.deleteWidget(this.widget);
      }
      this.widget = null;
      this.state.isBuilt = false;
    } catch (error) {
      this.handleError("Failed to destroy city widget", error);
    }
  }
}
