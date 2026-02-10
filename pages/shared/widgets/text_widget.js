import * as hmUI from "@zos/ui";
import { DEVICE_WIDTH, SHARED_UI_BUILDERS } from "../index.r.layout";
import { BaseWidget } from "./base_widget";

export class TextWidget extends BaseWidget {
  constructor({
    parentWidget,
    pageState,
    layout,
    text = "",
    pageIndex = 0,
    x,
    y,
    w,
    h,
    color,
    textSize,
    textStyle,
    alignH,
    alignV,
    lineSpace,
    charSpace,
    startAngle,
    endAngle,
    mode,
    radius,
    clickHandler = null,
  }) {
    super({ parentWidget, pageState });
    this.layout = layout;
    this.text = text;
    this.pageIndex = pageIndex;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.textSize = textSize;
    this.textStyle = textStyle;
    this.alignH = alignH;
    this.alignV = alignV;
    this.lineSpace = lineSpace;
    this.charSpace = charSpace;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.mode = mode;
    this.radius = radius;
    this.clickHandler = clickHandler;
  }

  onBuild() {
    this.widget = SHARED_UI_BUILDERS.createText({
      parentWidget: this.parentWidget,
      layout: this.layout,
      text: this.text,
      pageIndex: this.pageIndex,
      props: this._buildProps(),
    });
    this._bindClickHandlers();
  }

  onUpdate({
    text,
    x,
    y,
    w,
    h,
    color,
    textSize,
    textStyle,
    alignH,
    alignV,
    lineSpace,
    charSpace,
    startAngle,
    endAngle,
    mode,
    radius,
    clickHandler,
  } = {}) {
    if (text !== undefined) this.text = text;
    if (x !== undefined) this.x = x;
    if (y !== undefined) this.y = y;
    if (w !== undefined) this.w = w;
    if (h !== undefined) this.h = h;
    if (color !== undefined) this.color = color;
    if (textSize !== undefined) this.textSize = textSize;
    if (textStyle !== undefined) this.textStyle = textStyle;
    if (alignH !== undefined) this.alignH = alignH;
    if (alignV !== undefined) this.alignV = alignV;
    if (lineSpace !== undefined) this.lineSpace = lineSpace;
    if (charSpace !== undefined) this.charSpace = charSpace;
    if (startAngle !== undefined) this.startAngle = startAngle;
    if (endAngle !== undefined) this.endAngle = endAngle;
    if (mode !== undefined) this.mode = mode;
    if (radius !== undefined) this.radius = radius;
    if (clickHandler !== undefined) {
      this._unbindClickHandler();
      this.clickHandler = clickHandler;
      this._bindClickHandlers();
    }
  }

  onUpdateView() {
    this.widget.setProperty(hmUI.prop.MORE, {
      ...this.layout,
      x: (this.layout.x || 0) + this.pageIndex * DEVICE_WIDTH,
      text: this.text,
      ...this._buildProps(),
    });
  }

  _buildProps() {
    const props = {};
    if (this.x !== undefined) props.x = this.x;
    if (this.y !== undefined) props.y = this.y;
    if (this.w !== undefined) props.w = this.w;
    if (this.h !== undefined) props.h = this.h;
    if (this.color !== undefined) props.color = this.color;
    if (this.textSize !== undefined) props.text_size = this.textSize;
    if (this.textStyle !== undefined) props.text_style = this.textStyle;
    if (this.alignH !== undefined) props.align_h = this.alignH;
    if (this.alignV !== undefined) props.align_v = this.alignV;
    if (this.lineSpace !== undefined) props.line_space = this.lineSpace;
    if (this.charSpace !== undefined) props.char_space = this.charSpace;
    if (this.startAngle !== undefined) props.start_angle = this.startAngle;
    if (this.endAngle !== undefined) props.end_angle = this.endAngle;
    if (this.mode !== undefined) props.mode = this.mode;
    if (this.radius !== undefined) props.radius = this.radius;
    return props;
  }

  _bindClickHandlers() {
    if (!this.widget || !this.clickHandler) return;
    this.widget.addEventListener(hmUI.event.CLICK_UP, this.clickHandler);
  }

  _unbindClickHandler() {
    if (this.clickHandler) {
      this.widget?.removeEventListener(hmUI.event.CLICK_UP, this.clickHandler);
    }
  }

  onDestroy() {
    this._unbindClickHandler();
  }
}
