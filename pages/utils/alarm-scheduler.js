import { set, cancel, getAllAlarms, REPEAT_ONCE, REPEAT_HOUR } from "@zos/alarm";
import { DeviceLogger } from "./device-logger";
import { PrayersService } from "./prayers-service";
import { StorageService } from "./storage-service";

const logger = new DeviceLogger("alarm-scheduler");

export class AlarmScheduler {
    static setupPrayerScheduler(force = false) {
        try {
            const existingId = StorageService.getItem('schedulerHeartbeatId');

            if (existingId && this.isAlarmExist(existingId)) {
                if (!force) return;

                cancel(existingId);
            }

            const newId = set({
                url: "app-service/scheduler-service",
                delay: 3,
                param: "",
                store: true,
                repeat_type: REPEAT_HOUR,
            });

            StorageService.setItem('schedulerHeartbeatId', newId, { markForPush: false });
            logger.info(`Scheduled hourly heartbeat starting in 3s (ID: ${newId})`);
        } catch (error) {
            logger.error(`Error in setupPrayerScheduler: ${error}`);
        }
    }

    static scheduleNextPrayer() {
        try {
            // Cancel previous prayer alarm
            const prevId = StorageService.getItem('nextPrayerAlarmId');
            if (prevId) {
                cancel(prevId);
                StorageService.removeItem('nextPrayerAlarmId');
            }

            const now = new Date();
            const enabledPrayers = PrayersService.getNotifyEnabledPrayers();

            // 1. Try to find next prayer today
            let nextPrayer = PrayersService.getNextPrayerTime(now, now, enabledPrayers);

            // 2. If none today, check tomorrow
            if (!nextPrayer) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                nextPrayer = PrayersService.getNextPrayerTime(tomorrow, now, enabledPrayers);
            }

            if (nextPrayer) {
                const { prayer, time } = nextPrayer;
                const alarmTime = new Date(time);

                const newId = set({
                    url: "pages/alarm/index",
                    time: Math.floor(alarmTime.getTime() / 1000),
                    param: JSON.stringify({ type: "alarm", prayerName: prayer.toLowerCase(), prayerTime: alarmTime.toISOString() }),
                    store: true,
                    repeat_type: REPEAT_ONCE,
                });

                StorageService.setItem('nextPrayerAlarmId', newId, { markForPush: false });
                logger.info(`Scheduled ${prayer} at ${alarmTime.toLocaleString()} (ID: ${newId})`);
            } else {
                logger.warn("No next prayer found to schedule.");
            }

        } catch (error) {
            logger.error(`Error in scheduleNextPrayer: ${error}`);
        }
    }

    static isAlarmExist(id) {
        try {
            const alarms = getAllAlarms();
            return alarms.includes(id);
        } catch (error) {
            logger.error(`Error in isAlarmExist: ${error}`);
            return false;
        }
    }

    static cancelAllAlarms() {
        try {
            getAllAlarms().forEach(id => {
                cancel(id);
            });
            StorageService.removeItem('nextPrayerAlarmId');
            StorageService.removeItem('schedulerHeartbeatId');
        } catch (error) {
            logger.error(`Error in cancelAllAlarms: ${error}`);
        }
    }
}
