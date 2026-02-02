import * as hmUI from "@zos/ui";
import * as sensor from "@zos/sensor";
import { set, REPEAT_ONCE } from "@zos/alarm";
import { push } from "@zos/router";
import { px } from "@zos/utils";
import { BasePage } from "../shared/base_page";
import { TextWidget, ButtonWidget } from "../shared/widgets";
import { LAYOUT } from "./index.r.layout";
import { DeviceLogger } from "../utils/device-logger";
import { StorageService } from "../utils/storage-service";

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
            { text: "Onboarding", handler: () => this.debugNavigate("onboarding") },
            { text: "Connection Req", handler: () => this.debugNavigate("connectionRequirement") },
            { text: "Test Alarm", handler: () => this._scheduleTestAlarm() },
            { text: "Test Service (5s)", handler: () => this._scheduleService() },
            { text: "Local Inc", handler: () => this.localIncrement() },
            { text: "Test Buzzer", handler: () => this._testBuzzer() },
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

        this.widgets.countText = new TextWidget({
            parentWidget: container,
            pageState: null,
            text: `Runs: ${this.getDebugCount()}`,
            layout: {
                ...LAYOUT.COUNT_TEXT,
                y: lastBtnY + px(15),
            },
        });

        this.widgets.buzzerStatus = new TextWidget({
            parentWidget: container,
            pageState: null,
            text: "Status: Ready",
            layout: {
                ...LAYOUT.BUZZER_STATUS,
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
    }

    getLastScheduleTime() {
        try {
            const time = this.globalState.storage.getItem('lastAlarmScheduleTime');

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
            prayerName: "Fajr",
            prayerTime: "05:23 AM",
        };
        push({ url: "pages/alarm/index" });
    }

    _scheduleService() {
        logger.debug("Debug: Scheduling service in 5s");
        set({
            url: "app-service/debug-service",
            delay: 5,
            store: false,
            repeat_type: REPEAT_ONCE
        });
    }

    _testBuzzer() {
        logger.debug("Debug: Testing Buzzer");
        try {
            if (!sensor || !sensor.Buzzer) {
                this.widgets.buzzerStatus.update({ text: "Buzzer API Missing" });
                logger.warn("sensor.Buzzer is undefined");
                return;
            }

            const buzzer = new sensor.Buzzer();
            if (buzzer.isEnabled()) {
                const type = buzzer.getSourceType().ALARM;
                buzzer.start(type);
                this.widgets.buzzerStatus.update({ text: "Buzzer Playing" });
                logger.debug("Buzzer started");
            } else {
                this.widgets.buzzerStatus.update({ text: "Buzzer Disabled" });
                logger.warn("Buzzer disabled");
            }
        } catch (e) {
            logger.error("Buzzer error", e);
            this.widgets.buzzerStatus.update({ text: "Err: " + e.message });
        }
    }

    localIncrement() {
        try {
            const storage = new StorageService("file", "debug_fs");
            const current = storage.getItem('debugAlarmCount') || 0;
            storage.setItem('debugAlarmCount', current + 1);
            storage.destroy();

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
            const storage = new StorageService("file", "debug_fs");
            const count = storage.getItem('debugAlarmCount') || 0;
            logger.debug(`[Page] Read Count: ${count}`);
            storage.destroy();
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
