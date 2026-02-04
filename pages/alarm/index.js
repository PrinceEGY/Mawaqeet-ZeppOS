import { AlarmPage } from "./alarm-page";

import { AlarmScheduler } from "../utils/alarm-scheduler";

let alarmPage = null;

Page({
    onInit() {
        AlarmScheduler.rescheduleAlarms();

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
