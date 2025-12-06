import * as hmUI from "@zos/ui";
import { DEVICE_WIDTH, SHARED_UI_BUILDERS } from "../index.r.layout";
import { BaseWidget } from "./base_widget";

export class ImageWidget extends BaseWidget {
  constructor({
    parentWidget,
    pageState,
    layout,
    src,
    pageIndex = 0,
    x,
    y,
    w,
    h,
    posX,
    posY,
    angle,
    centerX,
    centerY,
    alpha,
    autoScale = true,
    autoScaleObjFit,
  }) {
    super({ parentWidget, pageState });
    this.layout = layout;
    this.src = src;
    this.pageIndex = pageIndex;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.posX = posX;
    this.posY = posY;
    this.angle = angle;
    this.centerX = centerX;
    this.centerY = centerY;
    this.alpha = alpha;
    this.autoScale = autoScale;
    this.autoScaleObjFit = autoScaleObjFit;
  }

  onBuild() {
    this.widget = SHARED_UI_BUILDERS.createImage({
      parentWidget: this.parentWidget,
      layout: this.layout,
      src: this.src,
      pageIndex: this.pageIndex,
      props: this._buildProps(),
    });
  }

  onUpdate({
    src,
    x,
    y,
    w,
    h,
    posX,
    posY,
    angle,
    centerX,
    centerY,
    alpha,
    autoScale,
    autoScaleObjFit,
  } = {}) {
    if (src !== undefined) this.src = src;
    if (x !== undefined) this.x = x;
    if (y !== undefined) this.y = y;
    if (w !== undefined) this.w = w;
    if (h !== undefined) this.h = h;
    if (posX !== undefined) this.posX = posX;
    if (posY !== undefined) this.posY = posY;
    if (angle !== undefined) this.angle = angle;
    if (centerX !== undefined) this.centerX = centerX;
    if (centerY !== undefined) this.centerY = centerY;
    if (alpha !== undefined) this.alpha = alpha;
    if (autoScale !== undefined) this.autoScale = autoScale;
    if (autoScaleObjFit !== undefined) this.autoScaleObjFit = autoScaleObjFit;
  }

  onUpdateView() {
    this.widget.setProperty(hmUI.prop.MORE, {
      ...this.layout,
      x: (this.layout.x || 0) + this.pageIndex * DEVICE_WIDTH,
      src: this.src,
      ...this._buildProps(),
    });
  }

  _buildProps() {
    const props = {};
    if (this.x !== undefined) props.x = this.x;
    if (this.y !== undefined) props.y = this.y;
    if (this.w !== undefined) props.w = this.w;
    if (this.h !== undefined) props.h = this.h;
    if (this.posX !== undefined) props.pos_x = this.posX;
    if (this.posY !== undefined) props.pos_y = this.posY;
    if (this.angle !== undefined) props.angle = this.angle;
    if (this.centerX !== undefined) props.center_x = this.centerX;
    if (this.centerY !== undefined) props.center_y = this.centerY;
    if (this.alpha !== undefined) props.alpha = this.alpha;
    if (this.autoScale !== undefined) props.auto_scale = this.autoScale;
    if (this.autoScaleObjFit !== undefined)
      props.auto_scale_obj_fit = this.autoScaleObjFit;
    return props;
  }
}
