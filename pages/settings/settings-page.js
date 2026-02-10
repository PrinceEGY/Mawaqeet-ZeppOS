import * as hmUI from "@zos/ui";
import { BasePage } from "../shared/base_page";
import { TextWidget } from "../shared/widgets";
import { DeviceLogger } from "../utils/device-logger";
import { LAYOUT } from "./index.r.layout";

const logger = new DeviceLogger("settings-page");

export class SettingsPage extends BasePage {
    constructor(globalState) {
        super(globalState);
        this.debugTapCount = 0;
        this.debugTapTimer = null;
    }

    onInit() {
        logger.debug("Settings page initialized");
    }

    onBuild() {
        this.widgets = {
            title: new TextWidget({
                pageState: this.pageState,
                text: LAYOUT.TITLE.text,
                layout: LAYOUT.TITLE,
                clickHandler: () => {
                    this.handleDebugTap();
                }
            })
        };
    }

    handleDebugTap() {
        this.debugTapCount++;
        logger.debug(`Debug tap count: ${this.debugTapCount}`);

        if (this.debugTapTimer) {
            clearTimeout(this.debugTapTimer);
        }

        if (this.debugTapCount >= 7) {
            this.debugTapCount = 0;
            this.globalState.navigate("debug");
            return;
        }

        this.debugTapTimer = setTimeout(() => {
            this.debugTapCount = 0;
        }, 2000); // Reset if not tapped quickly enough
    }
}
