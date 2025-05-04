import { BaseApp } from "@zeppos/zml/base-app";

App(
  BaseApp({
    globalData: {},
    onCreate() {
      this.request({ method: "openConnection" }); // Initiate request to open connection with the app side
      console.log("app on create invoke");
    },

    onDestroy() {
      console.log("app on destroy invoke");
    },
  })
);
