import { BaseApp } from "@zeppos/zml/base-app";

App(
  BaseApp({
    globalData: {},
    onCreate() {
      this.request(); // Initiate request to open connection with the app side
    },

    onDestroy() {
      console.log("app on destroy invoke");
    },
  })
);
