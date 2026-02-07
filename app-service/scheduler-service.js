import { exit } from "@zos/app-service";
import { AlarmScheduler } from "../pages/utils/alarm-scheduler";

AppService({
    onInit() {
        AlarmScheduler.scheduleNextPrayer();
        exit();
    },
});
