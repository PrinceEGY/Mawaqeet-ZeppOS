import { AlarmPage } from "./alarm-page";

import { StorageService } from "../utils/storage-service";
import { AlarmScheduler } from "../utils/alarm-scheduler";

let alarmPage = null;

Page({
    onInit() {
        new AlarmScheduler(new StorageService()).rescheduleAlarms();

        alarmPage = new AlarmPage();
        alarmPage.init();
    },

    build() {
        alarmPage.build();
        alarmPage.show();
    },

    onDestroy() {
        alarmPage?.destroy();
        alarmPage = null;
    },
});
