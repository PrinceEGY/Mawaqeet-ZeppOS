import * as hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { UI_BUILDERS } from "../index.r.layout";

const logger = Logger.getLogger("city-widget");

export class CityWidget {
  constructor(parentContainer, homePageState) {
    this.parentContainer = parentContainer;
    this.homePageState = homePageState;
    this.state = {
      isBuilt: false,
    };
    this.widget = null;

    this.homePageState.on(
      "locationChanged",
      this.handleLocationChange.bind(this)
    );
  }

  build() {
    try {
      if (this.state.isBuilt) {
        logger.debug("Widget already built");
        return;
      }

      const currentLocation = this.homePageState.getCurrentLocation();
      this.widget = UI_BUILDERS.createCityText(
        this.parentContainer,
        currentLocation
      );

      this.state.isBuilt = true;
    } catch (error) {
      this.handleError("Failed to build city widget", error);
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
      this.handleError("Failed to update city widget", error);
    }
  }

  handleLocationChange() {
    try {
      if (this.state.isBuilt) {
        this.updateView();
      }
    } catch (error) {
      this.handleError("Failed to handle location change", error);
    }
  }

  updateView() {
    if (!this.widget) return;

    const currentLocation = this.homePageState.getCurrentLocation();
    this.widget.setProperty(hmUI.prop.TEXT, currentLocation);
  }

  handleError(message, error) {
    logger.error(`${message}: ${error}`);
  }

  destroy() {
    try {
      this.homePageState.off(
        "locationChanged",
        this.handleLocationChange.bind(this)
      );
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
