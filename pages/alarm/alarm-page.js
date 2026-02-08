import { exit } from "@zos/app";
import { setPageBrightTime, setBrightness, getBrightness, pauseDropWristScreenOff, resetDropWristScreenOff } from "@zos/display";
import { BasePage } from "../shared/base_page";
import { ButtonWidget, TextWidget, ImageWidget } from "../shared/widgets";
import { DeviceLogger } from "../utils/device-logger";
import { AlarmPageState, AUTO_DISMISS_SECONDS } from "./alarm-page-state";
import { LAYOUT } from "./index.r.layout";
import { getPrayerLabel, PRAYER_ICONS } from "../../shared/constants";
import { RefreshManager } from "../utils/refresh-manager";

const logger = new DeviceLogger("alarm-page");

export class AlarmPage extends BasePage {
    constructor() {
        super(null);
        this._dismiss = this._dismiss.bind(this);
        this.lastSeconds = -1;
    }

    onInit() {
        this.pageState = new AlarmPageState();
        this.pageState.loadFromGlobalData();
        RefreshManager.setRefreshCallback(this.onRefresh.bind(this));
        logger.debug("AlarmPage initialized & RefreshCallback set");
    }

    onBuild() {
        const prayerName = this.pageState.state.prayerName;
        const iconSrc = PRAYER_ICONS[prayerName] || PRAYER_ICONS.fajr;

        this.widgets = {
            prayerIcon: new ImageWidget({
                pageState: this.pageState,
                src: iconSrc,
                layout: LAYOUT.PRAYER_ICON,
            }),
            prayerName: new TextWidget({
                pageState: this.pageState,
                text: getPrayerLabel(prayerName),
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
            autoDismissText: new TextWidget({
                pageState: this.pageState,
                text: "Auto dismiss in 30",
                layout: LAYOUT.AUTO_DISMISS_TEXT,
            }),
        };
        logger.debug("AlarmPage widgets built");
    }

    onShow() {
        this.originalBrightness = getBrightness();
        setBrightness(100);
        setPageBrightTime({ brightTime: AUTO_DISMISS_SECONDS * 1000 });
        pauseDropWristScreenOff({ duration: AUTO_DISMISS_SECONDS * 500 }); // Half of auto dismiss duration

        this.pageState.startVibration();
        this.pageState.startSound();
        logger.debug("AlarmPage shown, vibration, sound, and auto-dismiss started");
    }

    onRefresh() {
        if (!this.pageState) return;

        if (this.pageState.checkAutoDismiss()) {
            logger.debug("Auto-dismiss expired in onRefresh");
            this._dismiss();
            return;
        }

        const seconds = this.pageState.getRemainingSeconds();
        if (seconds !== this.lastSeconds) {
            this.lastSeconds = seconds;
            this.widgets?.autoDismissText?.update({ text: `Auto dismiss in ${seconds}` });
        }
    }

    onDestroy() {
        if (this.originalBrightness !== undefined && this.originalBrightness >= 0) {
            setBrightness(this.originalBrightness);
        }
        resetDropWristScreenOff();

        RefreshManager.clearRefreshCallback();
        this.pageState?.destroy();
        logger.debug("AlarmPage destroyed");
    }

    _dismiss() {
        logger.debug("Dismissing alarm page");
        RefreshManager.clearRefreshCallback();
        this.pageState?.destroy();
        exit();
    }
}
