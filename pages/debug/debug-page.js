import * as hmUI from "@zos/ui";

import { set, REPEAT_ONCE, getAllAlarms } from "@zos/alarm";
import { push } from "@zos/router";
import { px } from "@zos/utils";
import { BasePage } from "../shared/base_page";
import { TextWidget, ButtonWidget } from "../shared/widgets";
import { LAYOUT } from "./index.r.layout";
import { DeviceLogger } from "../utils/device-logger";
import { StorageService } from "../utils/storage-service";
import { AlarmScheduler } from "../utils/alarm-scheduler";

const logger = new DeviceLogger("debug-page");



export class DebugPage extends BasePage {
    constructor(globalState) {
        super(globalState);
    }

    onInit() {
        this._initActions();
        this.globalState.on('settingsChange', (data) => this._onStorageChange(data));
        logger.debug("Debug page initialized");
    }

    _initActions() {
        this.actions = [
            { text: "Home Page", handler: () => this.debugNavigate("home") },
            { text: "Test Alarm Page", handler: () => this._scheduleTestAlarm() },
            { text: "Sched Alarm (15s)", handler: () => this._scheduleRealAlarm() },
            { text: "Clear Alarms", handler: () => AlarmScheduler.cancelAllAlarms() },
            { text: "Reschedule", handler: () => AlarmScheduler.setupPrayerScheduler({ force: true }) },
            { text: "Local Inc", handler: () => this.localIncrement() },
        ];
    }

    onBuild() {
        this.widgets = {
            title: new TextWidget({
                pageState: null,
                text: "Debug Menu",
                layout: LAYOUT.TITLE,
            }),
        };

        const container = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
            ...LAYOUT.CONTAINER,
            scroll_enable: 1,
        });

        this.actions.forEach((action, index) => {
            this.widgets[`action_${index}`] = new ButtonWidget({
                parentWidget: container,
                pageState: null,
                text: action.text,
                layout: {
                    ...LAYOUT.DEBUG_BUTTON,
                    y: LAYOUT.getButtonY(index),
                },
                clickHandler: action.handler,
            });
        });

        const lastBtnY = LAYOUT.getButtonY(this.actions.length);

        this.widgets.alarmCountText = new TextWidget({
            parentWidget: container,
            pageState: null,
            text: `Alarms: ${getAllAlarms().length}`,
            layout: {
                ...LAYOUT.COUNT_TEXT,
                y: lastBtnY + px(15),
            },
        });

        this.widgets.countText = new TextWidget({
            parentWidget: container,
            pageState: null,
            text: `Runs: ${this.getDebugCount()}`,
            layout: {
                ...LAYOUT.COUNT_TEXT,
                y: lastBtnY + px(45),
            },
        });



        this.widgets.schedulerStatus = new TextWidget({
            parentWidget: container,
            pageState: null,
            text: `Last Sched: ${this.getLastScheduleTime()}`,
            layout: {
                ...LAYOUT.LAST_SCHEDULED_TEXT,
                y: lastBtnY + px(75),
            },
        });

        this.widgets.lastKeyText = new TextWidget({
            parentWidget: container,
            pageState: null,
            text: "Last Key: -",
            layout: {
                ...LAYOUT.LAST_KEY_TEXT,
                y: lastBtnY + px(105),
            },
        });


    }

    _onStorageChange({ key }) {
        this.widgets.lastKeyText.update({ text: `Key: ${key}` });
        if (key === 'lastAlarmScheduleTime') {
            this.widgets.schedulerStatus.update({ text: `Last Sched: ${this.getLastScheduleTime()}` });
        }
        this._updateAlarmCount();
    }

    getLastScheduleTime() {
        try {
            const time = StorageService.getItem('lastAlarmScheduleTime');

            if (!time) return "Never";

            const date = new Date(time);
            return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        } catch (e) {
            logger.error("Error reading last schedule", e);
            return "Error";
        }
    }

    _scheduleTestAlarm() {
        logger.debug("Debug: Opening Alarm page");
        getApp().globalData.alarmContext = {
            type: "alarm",
            prayerId: "fajr",
            prayerTime: "05:23 AM",
        };
        push({ url: "pages/alarm/index" });
    }

    _scheduleRealAlarm() {
        logger.debug("Debug: Scheduling real alarm in 15s");
        const time = new Date();
        time.setSeconds(time.getSeconds() + 15);

        set({
            url: "pages/alarm/index",
            time: Math.floor(time.getTime() / 1000),
            param: JSON.stringify({ type: "alarm", prayerId: "isha", prayerTime: time.toISOString() }),
            store: true,
            repeat_type: REPEAT_ONCE,
        });

        this._updateAlarmCount();
    }


    _updateAlarmCount() {
        try {
            const count = getAllAlarms().length;
            this.widgets.alarmCountText?.update({ text: `Alarms: ${count}` });
        } catch (e) {
            logger.error("Error updating alarm count", e);
        }
    }

    localIncrement() {
        try {
            const current = StorageService.getItem('debugAlarmCount') || 0;
            StorageService.setItem('debugAlarmCount', current + 1, { markForPush: false });

            const newCount = this.getDebugCount();
            this.widgets.countText.update({ text: `Runs: ${newCount}` });
            logger.debug(`[Page] Local incremented to: ${newCount}`);
        } catch (e) {
            logger.error("Error in localIncrement", e);
        }
    }

    debugNavigate(pageName) {
        this.globalState?.currentPage?.destroy();
        if (this.globalState) {
            this.globalState.currentPage = null;
            this.globalState.navigate(pageName);
        }
    }

    getDebugCount() {
        try {
            const count = StorageService.getItem('debugAlarmCount') || 0;
            logger.debug(`[Page] Read Count: ${count}`);
            return count;
        } catch (e) {
            logger.error("Error reading debug count", e);
            return 0;
        }
    }

    onDestroy() {
        this.globalState?.off('settingsChange', this._onStorageChange);
        logger.debug("Debug page destroyed");
    }
}
