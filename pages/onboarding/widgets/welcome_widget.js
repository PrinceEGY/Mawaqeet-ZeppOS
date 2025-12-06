import { BaseWidget, ImageWidget, TextWidget } from "../../shared/widgets";
import { LAYOUT } from "../index.r.layout";

export class WelcomeWidget extends BaseWidget {
  constructor({ parentWidget, pageState, pageIndex = 0 }) {
    super({ parentWidget, pageState });
    this.pageIndex = pageIndex;
    this.appIconWidget = null;
    this.titleWidget = null;
    this.taglineWidget = null;
    this.footerWidget = null;
  }

  onBuild() {
    this.appIconWidget = new ImageWidget({
      parentWidget: this.parentWidget,
      pageState: this.pageState,
      src: "app_icon.png",
      layout: LAYOUT.WELCOME.APP_ICON,
      pageIndex: this.pageIndex,
    });
    this.appIconWidget.build();

    this.titleWidget = new TextWidget({
      parentWidget: this.parentWidget,
      pageState: this.pageState,
      text: "Welcome to Mawaqeet",
      layout: LAYOUT.WELCOME.TITLE,
      pageIndex: this.pageIndex,
    });
    this.titleWidget.build();

    this.taglineWidget = new TextWidget({
      parentWidget: this.parentWidget,
      pageState: this.pageState,
      text: "Prayer Times on your wrist",
      layout: LAYOUT.WELCOME.TAGLINE,
      pageIndex: this.pageIndex,
    });
    this.taglineWidget.build();

    this.footerWidget = new TextWidget({
      parentWidget: this.parentWidget,
      pageState: this.pageState,
      text: "This is a one-time setup",
      layout: LAYOUT.WELCOME.FOOTER,
      pageIndex: this.pageIndex,
    });
    this.footerWidget.build();
  }

  onShow() {
    this.appIconWidget?.show();
    this.titleWidget?.show();
    this.taglineWidget?.show();
    this.footerWidget?.show();
  }

  onHide() {
    this.appIconWidget?.hide();
    this.titleWidget?.hide();
    this.taglineWidget?.hide();
    this.footerWidget?.hide();
  }

  onDestroy() {
    this.appIconWidget?.destroy();
    this.titleWidget?.destroy();
    this.taglineWidget?.destroy();
    this.footerWidget?.destroy();
    this.appIconWidget = null;
    this.titleWidget = null;
    this.taglineWidget = null;
    this.footerWidget = null;
  }
}
