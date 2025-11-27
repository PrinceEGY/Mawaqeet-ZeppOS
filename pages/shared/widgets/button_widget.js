import * as hmUI from "@zos/ui";
import { DEVICE_WIDTH, SHARED_UI_BUILDERS } from "../index.r.layout";
import { BaseWidget } from "./base_widget";

export class ButtonWidget extends BaseWidget {
  constructor({
    parentWidget,
    pageState,
    layout,
    text,
    clickHandler = null,
    isEnabled = true,
    disabledLayout = null,
    pageIndex = 0,
    props = {},
  }) {
    super({ parentWidget, pageState });
    this.layout = layout;
    this.text = text !== undefined ? text : layout.text || "";
    this.clickHandler = clickHandler;
    this.isEnabled = isEnabled;
    this.disabledLayout = disabledLayout;
    this.pageIndex = pageIndex;
    this.props = props;
  }

  onBuild() {
    const currentLayout = this.isEnabled
      ? this.layout
      : this.disabledLayout || this.layout;

    this.widget = SHARED_UI_BUILDERS.createButton({
      parentWidget: this.parentWidget,
      layout: currentLayout,
      text: this.text,
      pageIndex: this.pageIndex,
      props: this.props,
    });

    if (this.isEnabled && this.clickHandler) {
      this.widget.addEventListener(hmUI.event.CLICK_UP, this.clickHandler);
    }
  }

  onUpdate({ text, clickHandler, isEnabled, pageIndex, props = {} } = {}) {
    if (text !== undefined) this.text = text;
    if (clickHandler !== undefined) {
      if (this.widget && this.clickHandler) {
        this.widget.removeEventListener(hmUI.event.CLICK_UP, this.clickHandler);
      }
      this.clickHandler = clickHandler;
      if (this.widget && this.clickHandler && this.isEnabled) {
        this.widget.addEventListener(hmUI.event.CLICK_UP, this.clickHandler);
      }
    }
    if (isEnabled !== undefined) this.isEnabled = isEnabled;
    if (pageIndex !== undefined) this.pageIndex = pageIndex;
    this.props = { ...this.props, ...props };
  }

  onUpdateView() {
    const currentLayout = this.isEnabled
      ? this.layout
      : this.disabledLayout || this.layout;

    const finalProps = {
      ...currentLayout,
      x: currentLayout.x + (this.pageIndex || 0) * DEVICE_WIDTH,
      ...this.props,
      text: this.text,
    };

    this.widget.setProperty(hmUI.prop.MORE, finalProps);
  }

  onDestroy() {
    if (this.widget && this.clickHandler) {
      this.widget.removeEventListener(hmUI.event.CLICK_UP, this.clickHandler);
    }
    this.clickHandler = null;
  }
}
