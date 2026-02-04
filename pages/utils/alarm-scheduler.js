import { set, cancel, getAllAlarms, REPEAT_ONCE } from "@zos/alarm";
import { DeviceLogger } from "./device-logger";
import { PrayersService } from "./prayers-service";
import { StorageService } from "./storage-service";

const logger = new DeviceLogger("alarm-scheduler");

const THROTTLE_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 days
const SCHEDULE_WINDOW = 7; // days

export class AlarmScheduler {
    static rescheduleAlarms({ force = false } = {}) {
        try {
            const lastTime = StorageService.getItem('lastAlarmScheduleTime') || 0;
            const now = Date.now();

            if (!force && (now - lastTime < THROTTLE_DURATION)) {
                logger.debug('Skipping reschedule (throttled)');
                return;
            }

            logger.info(`Rescheduling alarms (Force: ${force})...`);
            this.cancelAllAlarms();

            for (let i = 0; i < SCHEDULE_WINDOW; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                this.scheduleAlarmsForDay(date);
            }

            StorageService.setItem('lastAlarmScheduleTime', now, { markForPush: false });
            logger.info('Alarm rescheduling complete');

        } catch (error) {
            logger.error(`Error in rescheduleAlarms: ${error}`);
        }
    }

    static cancelAllAlarms() {
        try {
            const alarms = getAllAlarms();
            alarms.forEach((id) => cancel(id));
            logger.debug(`Cancelled ${alarms.length} existing alarms`);
        } catch (error) {
            logger.error(`Error cancelling alarms: ${error}`);
        }
    }

    static scheduleAlarmsForDay(date = new Date()) {
        const prayers = PrayersService.getNotifyEnabledPrayers();
        const times = PrayersService.getEffectiveDayPrayerTimes(date);

        if (!times?.timings) {
            logger.debug(`No prayer times found for date: ${date.toDateString()}`);
            return;
        }

        const now = new Date();
        const nowTimestamp = now.getTime();

        prayers.forEach((prayer) => {
            const timeStr = times.timings[prayer];
            if (!timeStr) return;

            const alarmTime = new Date(timeStr);

            // Only schedule future alarms
            if (alarmTime.getTime() > nowTimestamp) {
                this._scheduleAlarm(prayer, alarmTime);
            }
        });
    }

    static _scheduleAlarm(prayerName, time) {
        try {
            set({
                url: "pages/alarm/index",
                time: Math.floor(time.getTime() / 1000),
                param: JSON.stringify({ type: "alarm", prayerName, prayerTime: time.toISOString() }),
                store: true,
                repeat_type: REPEAT_ONCE,
            });
            logger.debug(`Scheduled ${prayerName} at ${time.toLocaleString()}`);
        } catch (error) {
            logger.error(`Failed to schedule alarm for ${prayerName}: ${error}`);
        }
    }
}
