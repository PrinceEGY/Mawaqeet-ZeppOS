import * as hmUI from "@zos/ui";
import { push } from "@zos/router";
import { BasePage } from "../shared/base_page";
import { TextWidget, ButtonWidget } from "../shared/widgets";
import { LAYOUT } from "./index.r.layout";
import { DeviceLogger } from "../utils/device-logger";

const logger = new DeviceLogger("debug-page");

const DEBUG_ACTIONS = [
    { id: "home", text: "Home Page" },
    { id: "onboarding", text: "Onboarding" },
    { id: "connection", text: "Connection Req" },
    { id: "alarm", text: "Test Alarm" },
];

export class DebugPage extends BasePage {
    constructor(globalState) {
        super(globalState);
    }

    onInit() {
        logger.debug("Debug page initialized");
    }

    onBuild() {
        this.widgets = {
            title: new TextWidget({
                pageState: null,
                text: "Debug Menu",
                layout: LAYOUT.TITLE,
            }),
        };

        DEBUG_ACTIONS.forEach((action, index) => {
            this.widgets[`btn_${action.id}`] = new ButtonWidget({
                pageState: null,
                text: action.text,
                layout: {
                    ...LAYOUT.DEBUG_BUTTON,
                    y: LAYOUT.getButtonY(index),
                },
                clickHandler: () => this.handleAction(action.id),
            });
        });
    }

    handleAction(actionId) {
        switch (actionId) {
            case "home":
                logger.debug("Debug: Navigate to Home");
                this.debugNavigate("home");
                break;
            case "onboarding":
                logger.debug("Debug: Navigate to Onboarding");
                this.debugNavigate("onboarding");
                break;
            case "connection":
                logger.debug("Debug: Navigate to ConnectionRequirement");
                this.debugNavigate("connectionRequirement");
                break;
            case "alarm":
                logger.debug("Debug: Opening Alarm page");
                getApp().globalData.alarmContext = {
                    type: "alarm",
                    prayerName: "Fajr",
                    prayerTime: "05:23 AM",
                };
                push({ url: "pages/alarm/index" });
                break;
            default:
                logger.warn(`Unknown debug action: ${actionId}`);
        }
    }

    debugNavigate(pageName) {
        this.globalState?.currentPage?.destroy();
        if (this.globalState) {
            this.globalState.currentPage = null;
            this.globalState.navigate(pageName);
        }
    }

    onDestroy() {
        logger.debug("Debug page destroyed");
    }
}
