import * as hmUI from "@zos/ui";
import { SHARED_UI_BUILDERS } from "../index.r.layout";
import { BaseWidget } from "./base_widget";

export class TextWidget extends BaseWidget {
  constructor({
    parentWidget,
    pageState,
    layout,
    text = "",
    pageIndex = 0,
    props = {},
  }) {
    super({ parentWidget, pageState });
    this.layout = layout;
    this.text = text;
    this.pageIndex = pageIndex;
    this.props = props;
  }

  onBuild() {
    this.widget = SHARED_UI_BUILDERS.createText({
      parentWidget: this.parentWidget,
      layout: this.layout,
      text: this.text,
      pageIndex: this.pageIndex,
      props: this.props,
    });
  }

  onUpdate({ text, props = {} } = {}) {
    if (text !== undefined) this.text = text;
    this.props = { ...this.props, ...props };
  }

  onUpdateView() {
    this.widget.setProperty(hmUI.prop.MORE, {
      ...this.props,
      text: this.text,
    });
  }
}
