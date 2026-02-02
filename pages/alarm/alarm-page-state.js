import { Vibrator, VIBRATOR_SCENE_CALL } from "@zos/sensor";
import { create, id } from "@zos/media";
import { DeviceLogger } from "../utils/device-logger";
import { getPrayerLabel } from "../../shared/constants";
import { DateUtils } from "../../shared/utils/date-utils";

const logger = new DeviceLogger("alarm-page-state");

const AUTO_DISMISS_MS = 10000;

export class AlarmPageState {
    constructor() {
        this.state = {
            prayerName: "Prayer",
            prayerTime: "--:--",
        };
        this.vibrator = null;
        this.player = null;
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
        return getPrayerLabel(this.state.prayerName);
    }

    getPrayerTime() {
        try {
            const date = new Date(this.state.prayerTime);
            return DateUtils.formatCurrentTime(date, false);
        } catch (e) {
            logger.error("Failed to parse prayer time: " + e);
            return this.state.prayerTime;
        }
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

    startSound() {
        try {
            this.player = create(id.PLAYER);
            this.player.addEventListener(this.player.event.PREPARE, (result) => {
                if (result) {
                    logger.debug("Audio prepared, starting playback");
                    this.player.start();
                } else {
                    logger.warn("Audio prepare failed");
                }
            });
            this.player.setSource(this.player.source.FILE, { file: "notify.mp3" });
            this.player.prepare();
            logger.debug("Audio player created");
        } catch (e) {
            logger.warn("Failed to create audio player: " + e.message);
            this.player = null;
        }
    }

    stopSound() {
        if (this.player) {
            try {
                this.player.stop();
                logger.debug("Audio stopped");
            } catch (e) {
                logger.warn("Failed to stop audio: " + e.message);
            }
            this.player = null;
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
        this.stopSound();
        this.clearAutoDismiss();
        logger.debug("AlarmPageState cleanup complete");
    }

    destroy() {
        this.cleanup();
        this.state = null;
        logger.debug("AlarmPageState destroyed");
    }
}
