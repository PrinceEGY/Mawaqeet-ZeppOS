import * as hmUI from "@zos/ui";
import { DeviceLogger } from "../../utils/device-logger";
import { SHARED_UI_BUILDERS } from "../index.r.layout";

const logger = new DeviceLogger("shared-text-widget");

export class TextWidget {
  constructor({
    parentWidget,
    pageState,
    text,
    layout,
    pageIndex = 0,
    props = {},
  }) {
    this.parentWidget = parentWidget;
    this.pageState = pageState;
    this.text = text;
    this.layout = layout;
    this.pageIndex = pageIndex;
    this.props = props;
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

      this.widget = SHARED_UI_BUILDERS.createText({
        parentWidget: this.parentWidget,
        layout: this.layout,
        text: this.text,
        pageIndex: this.pageIndex,
        props: this.props,
      });

      this.state.isBuilt = true;
    } catch (error) {
      this.handleError("Failed to build text widget", error);
    }
  }

  update({ text, props = {} } = {}) {
    try {
      if (text !== undefined) {
        this.text = text;
        props.text = text;
      }

      this.props = { ...this.props, ...props };

      if (!this.state.isBuilt) {
        this.build();
        return;
      }

      if (this.widget) {
        this.widget.setProperty(hmUI.prop.MORE, this.props);
      }
    } catch (error) {
      this.handleError("Failed to update text widget", error);
    }
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
      this.handleError("Failed to destroy text widget", error);
    }
  }
}
