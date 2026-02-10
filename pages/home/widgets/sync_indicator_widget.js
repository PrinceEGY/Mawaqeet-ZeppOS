import * as hmUI from "@zos/ui";
import { ButtonWidget } from "../../shared/widgets/button_widget";
import { LAYOUT, COLORS } from "../../shared/index.r.layout";

export class SyncIndicatorWidget extends ButtonWidget {
    constructor({ parentWidget, globalState }) {
        super({
            parentWidget: parentWidget || hmUI,
            pageState: null,
            layout: LAYOUT.SYNC_INDICATOR.ICON,
            clickHandler: () => {
                this.globalState.triggerFullSync();
            },
        });
        this.globalState = globalState;
        this.syncStateListener = null;
        this.bgWidget = null;
    }

    onBuild() {
        this.bgWidget = this.parentWidget.createWidget(hmUI.widget.FILL_RECT, {
            ...LAYOUT.SYNC_INDICATOR.BACKGROUND,
        });
        super.onBuild();

        this.syncStateListener = () => {
            this.update();
        };

        this.globalState.on("syncPendingFlagChanged", this.syncStateListener);
        this.globalState.on("syncStateChanged", this.syncStateListener);
    }

    onUpdate() {
        const isSyncing = this.globalState.syncManager.isSyncing();
        const isPending = this.globalState.pendingSyncFlag;

        if (isSyncing || isPending) {
            this.show();
            this.bgWidget.setProperty(hmUI.prop.VISIBLE, true);

            if (isSyncing) {
                this.bgWidget.setProperty(hmUI.prop.COLOR, COLORS.GREY_BACKGROUND);
            } else {
                this.bgWidget.setProperty(hmUI.prop.COLOR, COLORS.PRIMARY);
            }
        } else {
            this.hide();
            this.bgWidget.setProperty(hmUI.prop.VISIBLE, false);
        }
    }

    onDestroy() {
        if (this.syncStateListener) {
            this.globalState.off("syncPendingFlagChanged", this.syncStateListener);
            this.globalState.off("syncStateChanged", this.syncStateListener);
            this.syncStateListener = null;
        }

        if (this.bgWidget) {
            hmUI.deleteWidget(this.bgWidget);
            this.bgWidget = null;
        }

        super.onDestroy();
    }
}
