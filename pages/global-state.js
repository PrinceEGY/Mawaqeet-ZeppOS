import { connectStatus, addListener, removeListener } from "@zos/ble";
import { EventBus } from "@zos/utils";
import { DeviceLogger } from "./utils/device-logger";
import { PrayersService } from "./utils/prayers-service";
import { RefreshManager } from "./utils/refresh-manager";
import { StorageService } from "./utils/storage-service";
import { SyncManager } from "./utils/sync-manager";
import { AlarmScheduler } from "./utils/alarm-scheduler";
import { debounce } from "../shared/helpers";


import { SettingInitializer } from "../shared/utils/setting-init";

const logger = new DeviceLogger("global-state");

export class GlobalState {
  constructor(request, call) {
    this.eventBus = new EventBus();
    this.syncManager = new SyncManager(request, call);
    this.currentPage = null;
    this.pages = {};

    this._isConnected = false;
    this._onConnectionChange = this._onConnectionChange.bind(this);
    this._isNavigating = false;
    this.syncPending = false;

    this.scheduleNextPrayerDebounced = debounce(() => {
      logger.debug(`Settings changed, rescheduling alarms`);
      AlarmScheduler.scheduleNextPrayer();
    }, 2000);
  }

  init() {
    StorageService.on("change", this._onStorageChange);

    // A small delay to mitigate the slow startup on the first app run
    setTimeout(() => {
      SettingInitializer.initDefaultSettings(StorageService, logger);
    }, 1000);

    AlarmScheduler.setupPrayerScheduler();

    RefreshManager.setRefreshCallback(() => {
      this.currentPage?.refresh?.();
    });

    this.syncManager.onSyncStateChange = (isSyncing) => {
      if (!isSyncing) {
        this.resetSyncPending();
      }
      this.emit("syncStateChanged", isSyncing);
    };

    this._isConnected = connectStatus();
    addListener(this._onConnectionChange);

    setTimeout(() => {
      this.triggerFullSync();
    }, 3000);

    logger.debug("GlobalState initialized");
  }

  _onStorageChange = (data) => {
    if (data.key?.startsWith("notify:") || data.key === "currentLocation" || data.key === "calculationMethod") {
      if (data.key === "currentLocation" || data.key === "calculationMethod") {
        PrayersService.clearCache();
      }
      this.scheduleNextPrayerDebounced();
    }

    this.emit("settingsChange", data);
  };

  registerPage(name, pageInstance) {
    this.pages[name] = pageInstance;
    logger.debug(`Page registered: ${name}`);
  }

  navigate(pageName) {
    if (!this.pages[pageName]) {
      logger.error(`Page not found: ${pageName}`);
      return;
    }
    this._navigateToPage(pageName);
  }

  _navigateToPage(pageName) {
    if (this._isNavigating) {
      logger.debug(`Already navigating, skipping navigation to: ${pageName}`);
      return;
    }

    this._isNavigating = true;
    this.currentPage?.hide();

    const page = this.pages[pageName];
    if (!page.isBuilt) {
      page.init();
      page.build();
    }

    page.show();
    this.currentPage = page;
    this._isNavigating = false;
    logger.debug(`Navigated to: ${pageName}`);

    this.emit("pageChanged", pageName);
  }

  isConnected() {
    return this._isConnected;
  }

  _stopConnectionMonitoring() {
    removeListener(this._onConnectionChange);
  }

  _onConnectionChange(status) {
    if (this._isConnected !== status) {
      this._isConnected = status;
      logger.debug(`Connection status changed: ${this._isConnected}`);
      this.emit("connectionChanged", this._isConnected);
    }
  }

  getCurrentPageName() {
    for (const [name, page] of Object.entries(this.pages)) {
      if (page === this.currentPage) return name;
    }
    return null;
  }

  setSyncPending() {
    this.syncPending = true;
    this.emit("syncPendingChanged", true);
  }

  resetSyncPending() {
    this.syncPending = false;
    this.emit("syncPendingChanged", false);
  }

  triggerFullSync() {
    this.syncManager.triggerFullSync();
  }


  on(eventName, listener) {
    this.eventBus.on(eventName, listener);
  }

  off(eventName, listener) {
    this.eventBus.off(eventName, listener);
  }

  emit(eventName, ...args) {
    this.eventBus.emit(eventName, ...args);
  }

  resetApp() {
    logger.info("Resetting app...");

    StorageService.clear();
    PrayersService.clearCache();
    AlarmScheduler.cancelAllAlarms();
    this.syncManager.reset();
    this.resetSyncPending();

    this.navigate("home");

    Object.values(this.pages).forEach((page) => {
      if (page !== this.currentPage) {
        page?.destroy?.();
      }
    });
  }


  isAppInitialized() {
    return StorageService.getItem("__app_initialized__");
  }

  destroy() {
    RefreshManager.clear();
    this._stopConnectionMonitoring();

    StorageService.off("change", this._onStorageChange);
    this.eventBus?.clear();

    Object.values(this.pages).forEach((page) => {
      page?.destroy?.();
    });

    this.syncManager?.destroy();
    this.syncManager = null;

    PrayersService.clearCache();

    StorageService.destroy();

    this.pages = {};
    this.currentPage = null;

    logger.debug("GlobalState destroyed");
  }
}
