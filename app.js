import { BaseApp } from "@zeppos/zml/base-app";
import { log as Logger } from "@zos/utils";

const logger = Logger.getLogger("app");

App(
  BaseApp({
    globalData: {
      alarmContext: null,
    },
    onCreate(params) {
      let context = null;

      if (params) {
        try {
          context = JSON.parse(params);
        } catch (e) {
          logger.warn("Failed to parse onCreate params:", params);
        }
      }

      if (context?.type === "alarm") {
        this.globalData.alarmContext = context;
        logger.debug("Alarm wake-up, context:", context);
        return;
      }

      this.request({ method: "openConnection" }); // Initiate request to open connection with the app side
      logger.debug("app on create invoke");
    },

    onDestroy() {
      logger.debug("app on destroy invoke");
    },
  })
);
