import { BasePage } from "../shared/base_page";
import { ImageWidget, TextWidget } from "../shared/widgets";
import { DeviceLogger } from "../utils/device-logger";
import { LAYOUT } from "./index.r.layout";

const logger = new DeviceLogger("connection-requirement-page");

export class ConnectionRequirementPage extends BasePage {
  constructor(globalState) {
    super(globalState);
  }

  onInit() {
    logger.debug("Connection requirement page initialized");
  }

  get reason() {
    const requirement = this.globalState.getConnectionRequirement();
    return requirement?.reason || "";
  }

  onBuild() {
    this.widgets = {
      icon: new ImageWidget({
        layout: LAYOUT.ICON,
        src: "bluetooth_disconnect.png",
      }),
      title: new TextWidget({
        layout: LAYOUT.TITLE,
        text: "Connect to Phone",
      }),
      reason: new TextWidget({
        layout: LAYOUT.REASON,
        text: this.reason,
      }),
    };
  }

  onShow() {
    logger.debug("Connection requirement page shown");
  }

  onHide() {
    logger.debug("Connection requirement page hidden");
  }

  onUpdate() {
    this.widgets.reason.update({ text: this.reason });
  }

  onDestroy() {
    logger.debug("Connection requirement page destroyed");
  }
}
