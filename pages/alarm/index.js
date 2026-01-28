import { AlarmPage } from "./alarm-page";

let alarmPage = null;

Page({
    onInit() {
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
