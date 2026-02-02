import { exit } from "@zos/router";
import { BasePage } from "../shared/base_page";
import { ButtonWidget, TextWidget } from "../shared/widgets";
import { DeviceLogger } from "../utils/device-logger";
import { AlarmPageState } from "./alarm-page-state";
import { LAYOUT } from "./index.r.layout";

const logger = new DeviceLogger("alarm-page");

export class AlarmPage extends BasePage {
    constructor() {
        super(null); // No globalState needed for alarm page
        this._dismiss = this._dismiss.bind(this);
    }

    onInit() {
        this.pageState = new AlarmPageState();
        this.pageState.loadFromGlobalData();
        logger.debug("AlarmPage initialized");
    }

    onBuild() {
        this.widgets = {
            prayerName: new TextWidget({
                pageState: this.pageState,
                text: this.pageState.getPrayerName(),
                layout: LAYOUT.PRAYER_NAME,
            }),
            prayerTime: new TextWidget({
                pageState: this.pageState,
                text: this.pageState.getPrayerTime(),
                layout: LAYOUT.PRAYER_TIME,
            }),
            dismissButton: new ButtonWidget({
                pageState: this.pageState,
                text: "Dismiss",
                layout: LAYOUT.DISMISS_BUTTON,
                clickHandler: this._dismiss,
            }),
        };
        logger.debug("AlarmPage widgets built");
    }

    onShow() {
        this.pageState.startVibration();
        this.pageState.startSound();
        this.pageState.startAutoDismiss(this._dismiss);
        logger.debug("AlarmPage shown, vibration, sound, and auto-dismiss started");
    }

    onDestroy() {
        this.pageState?.cleanup();
        logger.debug("AlarmPage destroyed");
    }

    _dismiss() {
        logger.debug("Dismissing alarm page");
        this.pageState?.cleanup();
        exit();
    }
}
