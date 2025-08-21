import * as hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { DEVICE_WIDTH, SHARED_UI_BUILDERS } from "../index.r.layout";

const logger = Logger.getLogger("shared-button-widget");

export class ButtonWidget {
  constructor({
    parentWidget,
    pageState,
    text,
    layout,
    disabledLayout = null,
    pageIndex = 0,
    props = {},
    clickHandler = null,
    isEnabled = true,
  }) {
    this.parentWidget = parentWidget;
    this.pageState = pageState;
    this.text = text;
    this.layout = layout;
    this.disabledLayout = disabledLayout;
    this.pageIndex = pageIndex;
    this.props = props;
    this.clickHandler = clickHandler;
    this.isEnabled = isEnabled;
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

      const currentLayout = this.isEnabled
        ? this.layout
        : this.disabledLayout || this.layout;
      const currentClickHandler = this.isEnabled ? this.clickHandler : null;

      this.widget = SHARED_UI_BUILDERS.createButton({
        parentWidget: this.parentWidget,
        layout: currentLayout,
        text: this.text,
        clickHandler: currentClickHandler,
        pageIndex: this.pageIndex,
        props: this.props,
      });

      this.state.isBuilt = true;
    } catch (error) {
      this.handleError("Failed to build button widget", error);
    }
  }

  update({ text, clickHandler, isEnabled, props = {} } = {}) {
    try {
      if (text !== undefined) {
        this.text = text;
      }

      if (clickHandler !== undefined) {
        this.clickHandler = clickHandler;
      }

      if (isEnabled !== undefined) {
        this.isEnabled = isEnabled;
      }

      this.props = { ...this.props, ...props };

      if (!this.state.isBuilt) {
        this.build();
        return;
      }

      this.updateView();
    } catch (error) {
      this.handleError("Failed to update button widget", error);
    }
  }

  updateView() {
    try {
      if (!this.widget) return;

      const currentLayout = this.isEnabled
        ? this.layout
        : this.disabledLayout || this.layout;
      const currentClickHandler = this.isEnabled ? this.clickHandler : null;

      const finalProps = {
        ...currentLayout,
        x: currentLayout.x + (this.pageIndex || 0) * DEVICE_WIDTH,
        ...this.props,
        text: this.text,
        click_func: currentClickHandler,
      };

      this.widget.setProperty(hmUI.prop.MORE, finalProps);
    } catch (error) {
      this.handleError("Failed to update button view", error);
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
      this.clickHandler = null;
    } catch (error) {
      this.handleError("Failed to destroy button widget", error);
    }
  }
}
