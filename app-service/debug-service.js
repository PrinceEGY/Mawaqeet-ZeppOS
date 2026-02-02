import { exit } from "@zos/app-service";
import { StorageService } from "../pages/utils/storage-service";
import { DeviceLogger } from "../pages/utils/device-logger";

const logger = new DeviceLogger("debug-service");

AppService({
    onInit() {
        logger.debug("Debug service started");
        try {
            const storage = new StorageService("file", "debug_fs");

            const current = storage.getItem('debugAlarmCount') || 0;
            logger.debug(`[Service] Read Count: ${current}`);

            const newCount = current + 1;
            logger.debug(`[Service] Writing Count: ${newCount}`);

            storage.setItem('debugAlarmCount', newCount);
            logger.debug("[Service] Persistence verified and saved");
            // StorageService for "file" doesn't have explicit destroy/save required in the same way as memory

        } catch (e) {
            logger.error("[Service] Error", e);
        }

    },

    onDestroy() {
        logger.debug("Debug service destroyed");
    }
});
