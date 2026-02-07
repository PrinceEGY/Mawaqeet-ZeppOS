import { AlarmPage } from "./alarm-page";
import { Wear } from "@zos/sensor";
import { exit } from "@zos/app-service";

let alarmPage = null;

Page({
    onInit() {
        if (!this.isWearing()) {
            console.log("Not wearing watch, skipping alarm");
            exit();
            return;
        }

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

    isWearing() {
        const wear = new Wear();
        const status = wear.getStatus();
        return status !== 0;
    },
});
