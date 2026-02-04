import * as hmUI from "@zos/ui";
import { BaseWidget } from "../../shared/widgets";
import { LAYOUT, UI_BUILDERS } from "../index.r.layout";

export class NoLocationWidget extends BaseWidget {
    constructor({ parentWidget, pageState }) {
        super({ parentWidget, pageState });
        this.titleWidget = null;
        this.subtitleWidget = null;
    }

    onBuild() {
        this.widget = UI_BUILDERS.createGroup({
            parentWidget: this.parentWidget,
            layout: LAYOUT.NO_DATA.CONTAINER,
        });

        this.titleWidget = UI_BUILDERS.createText({
            parentWidget: this.widget,
            layout: LAYOUT.NO_DATA.TITLE,
            text: "No location configured",
        });

        this.subtitleWidget = UI_BUILDERS.createText({
            parentWidget: this.widget,
            layout: LAYOUT.NO_DATA.RANGE,
            text: "Set your location in settings",
        });
    }

    onDestroy() {
        if (this.titleWidget) {
            hmUI.deleteWidget(this.titleWidget);
            this.titleWidget = null;
        }
        if (this.subtitleWidget) {
            hmUI.deleteWidget(this.subtitleWidget);
            this.subtitleWidget = null;
        }
    }
}
