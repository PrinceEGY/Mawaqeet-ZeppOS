import { Vibrator, VIBRATOR_SCENE_CALL } from "@zos/sensor";
import { DeviceLogger } from "../utils/device-logger";

const logger = new DeviceLogger("alarm-page-state");

const AUTO_DISMISS_MS = 10000;

export class AlarmPageState {
    constructor() {
        this.state = {
            prayerName: "Prayer",
            prayerTime: "--:--",
        };
        this.vibrator = null;
        this.dismissTimer = null;
        this.dismissCallback = null;
    }

    loadFromGlobalData() {
        const context = getApp()?.globalData?.alarmContext;
        if (context) {
            this.state.prayerName = context.prayerName || "Prayer";
            this.state.prayerTime = context.prayerTime || "--:--";
            logger.debug(
                `Loaded alarm context: ${this.state.prayerName} at ${this.state.prayerTime}`
            );
        } else {
            logger.warn("No alarm context found in globalData");
        }
    }

    getPrayerName() {
        return this.state.prayerName;
    }

    getPrayerTime() {
        return this.state.prayerTime;
    }

    startVibration() {
        this.vibrator = new Vibrator();
        this.vibrator.setMode(VIBRATOR_SCENE_CALL);
        this.vibrator.start();
        logger.debug("Vibration started");

        this.vibrationTimer = setTimeout(() => {
            this.stopVibration();
        }, 1000);
    }

    stopVibration() {
        if (this.vibrationTimer) {
            clearTimeout(this.vibrationTimer);
            this.vibrationTimer = null;
        }
        if (this.vibrator) {
            this.vibrator.stop();
            this.vibrator = null;
            logger.debug("Vibration stopped");
        }
    }

    startAutoDismiss(callback) {
        this.dismissCallback = callback;
        this.dismissTimer = setTimeout(() => {
            logger.debug("Auto-dismiss timer triggered");
            this.dismissCallback?.();
        }, AUTO_DISMISS_MS);
        logger.debug(`Auto-dismiss timer started (${AUTO_DISMISS_MS}ms)`);
    }

    clearAutoDismiss() {
        if (this.dismissTimer) {
            clearTimeout(this.dismissTimer);
            this.dismissTimer = null;
        }
        this.dismissCallback = null;
    }

    cleanup() {
        this.stopVibration();
        this.clearAutoDismiss();
        logger.debug("AlarmPageState cleanup complete");
    }

    destroy() {
        this.cleanup();
        this.state = null;
        logger.debug("AlarmPageState destroyed");
    }
}
