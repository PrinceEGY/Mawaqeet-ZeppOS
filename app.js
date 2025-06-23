import { BaseApp } from "@zeppos/zml/base-app";
import { log as Logger } from "@zos/utils";

const logger = Logger.getLogger("app");

App(
  BaseApp({
    globalData: {},
    onCreate() {
      this.request({ method: "openConnection" }); // Initiate request to open connection with the app side
      logger.debug("app on create invoke");
    },

    onDestroy() {
      logger.debug("app on destroy invoke");
    },
  })
);
