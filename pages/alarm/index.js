import { AlarmPage } from "./alarm-page";
import { Sleep, Wear } from "@zos/sensor";
import { exit } from "@zos/app-service";
import { StorageService } from "../utils/storage-service";

let alarmPage = null;

Page({
    onInit() {
        if (!this.isWearing()) {
            console.log("Not wearing watch, skipping alarm");
            exit();
            return;
        }

        const allowAlarmOnSleep = StorageService.getItem("allowAlarmOnSleep");

        if (this.isSleeping() && !allowAlarmOnSleep) {
            console.log("User is sleeping and allowAlarmOnSleep is disabled, skipping alarm");
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

    isSleeping() {
        const sleep = new Sleep();
        return sleep.getSleepingStatus() === 1;
    },
});
