import * as hmUI from "@zos/ui";
import { ButtonWidget } from "../../shared/widgets/button_widget";
import { LAYOUT } from "../../shared/index.r.layout";

export class SyncIndicatorWidget extends ButtonWidget {
    constructor({ parentWidget, globalState }) {
        super({
            parentWidget: parentWidget || hmUI,
            pageState: null,
            layout: LAYOUT.SYNC_INDICATOR,
            clickHandler: () => {
                this.globalState.startSync();
            },
        });
        this.globalState = globalState;
        this.syncStateListener = null;
    }

    onBuild() {
        super.onBuild();

        this.hide();

        this.syncStateListener = () => {
            this._checkSyncState();
        };

        this.globalState.on("syncPendingChanged", this.syncStateListener);

        this._checkSyncState();
    }

    _checkSyncState() {
        const isSyncing = this.globalState.syncManager.isSyncing();
        const isPending = this.globalState.syncPending;

        if (isPending && !isSyncing) {
            this.show();
        } else {
            this.hide();
        }
    }

    onDestroy() {
        if (this.syncStateListener) {
            this.globalState.off("syncPendingChanged", this.syncStateListener);
            this.syncStateListener = null;
        }
        super.onDestroy();
    }
}
