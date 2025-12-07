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
    longPressHandler = null,
    isEnabled = true,
    disabledLayout = null,
    pageIndex = 0,
    x,
    y,
    w,
    h,
    color,
    textSize,
    textW,
    normalColor,
    pressColor,
    radius,
    normalSrc,
    pressSrc,
  }) {
    super({ parentWidget, pageState });
    this.layout = layout;
    this.text = text !== undefined ? text : layout.text || "";
    this.clickHandler = clickHandler;
    this.longPressHandler = longPressHandler;
    this.isEnabled = isEnabled;
    this.disabledLayout = disabledLayout;
    this.pageIndex = pageIndex;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.textSize = textSize;
    this.textW = textW;
    this.normalColor = normalColor;
    this.pressColor = pressColor;
    this.radius = radius;
    this.normalSrc = normalSrc;
    this.pressSrc = pressSrc;
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
      props: this._buildProps(),
    });

    this._bindHandlers();
  }

  onUpdate({
    text,
    clickHandler,
    longPressHandler,
    isEnabled,
    pageIndex,
    x,
    y,
    w,
    h,
    color,
    textSize,
    textW,
    normalColor,
    pressColor,
    radius,
    normalSrc,
    pressSrc,
  } = {}) {
    if (text !== undefined) this.text = text;
    if (clickHandler !== undefined) {
      this._unbindClickHandler();
      this.clickHandler = clickHandler;
    }
    if (longPressHandler !== undefined) {
      this._unbindLongPressHandler();
      this.longPressHandler = longPressHandler;
    }
    if (isEnabled !== undefined) {
      const wasEnabled = this.isEnabled;
      this.isEnabled = isEnabled;
      if (wasEnabled !== isEnabled) {
        if (isEnabled) {
          this._bindHandlers();
        } else {
          this._unbindHandlers();
        }
      }
    }
    if (pageIndex !== undefined) this.pageIndex = pageIndex;
    if (x !== undefined) this.x = x;
    if (y !== undefined) this.y = y;
    if (w !== undefined) this.w = w;
    if (h !== undefined) this.h = h;
    if (color !== undefined) this.color = color;
    if (textSize !== undefined) this.textSize = textSize;
    if (textW !== undefined) this.textW = textW;
    if (normalColor !== undefined) this.normalColor = normalColor;
    if (pressColor !== undefined) this.pressColor = pressColor;
    if (radius !== undefined) this.radius = radius;
    if (normalSrc !== undefined) this.normalSrc = normalSrc;
    if (pressSrc !== undefined) this.pressSrc = pressSrc;
  }

  onUpdateView() {
    const currentLayout = this.isEnabled
      ? this.layout
      : this.disabledLayout || this.layout;

    this.widget.setProperty(hmUI.prop.MORE, {
      ...currentLayout,
      x: currentLayout.x + (this.pageIndex || 0) * DEVICE_WIDTH,
      text: this.text,
      ...this._buildProps(),
    });
  }

  onDestroy() {
    this._unbindHandlers();
    this.clickHandler = null;
    this.longPressHandler = null;
  }

  _buildProps() {
    const props = {};
    if (this.x !== undefined) props.x = this.x;
    if (this.y !== undefined) props.y = this.y;
    if (this.w !== undefined) props.w = this.w;
    if (this.h !== undefined) props.h = this.h;
    if (this.color !== undefined) props.color = this.color;
    if (this.textSize !== undefined) props.text_size = this.textSize;
    if (this.textW !== undefined) props.text_w = this.textW;
    if (this.normalColor !== undefined) props.normal_color = this.normalColor;
    if (this.pressColor !== undefined) props.press_color = this.pressColor;
    if (this.radius !== undefined) props.radius = this.radius;
    if (this.normalSrc !== undefined) props.normal_src = this.normalSrc;
    if (this.pressSrc !== undefined) props.press_src = this.pressSrc;
    return props;
  }

  _bindHandlers() {
    if (!this.widget || !this.isEnabled) return;
    if (this.clickHandler) {
      this.widget.addEventListener(hmUI.event.CLICK_UP, this.clickHandler);
    }
    if (this.longPressHandler) {
      this.widget.addEventListener(
        hmUI.event.LONG_PRESS,
        this.longPressHandler
      );
    }
  }

  _unbindHandlers() {
    this._unbindClickHandler();
    this._unbindLongPressHandler();
  }

  _unbindClickHandler() {
    if (this.clickHandler) {
      this.widget?.removeEventListener(hmUI.event.CLICK_UP, this.clickHandler);
    }
  }

  _unbindLongPressHandler() {
    if (this.longPressHandler) {
      this.widget?.removeEventListener(
        hmUI.event.LONG_PRESS,
        this.longPressHandler
      );
    }
  }
}
