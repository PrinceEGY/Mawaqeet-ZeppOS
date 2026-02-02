import { connectStatus } from "@zos/ble";
import { EventBus } from "@zos/utils";
import { DeviceLogger } from "./utils/device-logger";
import { PrayersService } from "./utils/prayers-service";
import { RefreshManager } from "./utils/refresh-manager";
import { StorageService } from "./utils/storage-service";
import { SyncManager } from "./utils/sync-manager";
import { AlarmScheduler } from "./utils/alarm-scheduler";

const logger = new DeviceLogger("global-state");

export class GlobalState {
  constructor(request, call) {
    this.storage = new StorageService();
    this.eventBus = new EventBus();
    this.syncManager = new SyncManager(request, call, this.storage);
    this.alarmScheduler = new AlarmScheduler(this.storage);
    this.currentPage = null;
    this.pages = {};

    this._isConnected = false;
    this._connectionCheckInterval = null;
    this._isNavigating = false;
  }

  init() {
    this.storage.on("change", this._onStorageChange);
    this.alarmScheduler.rescheduleAlarms();
    RefreshManager.setRefreshCallback(() => {
      this.currentPage?.refresh?.();
    });

    this.syncManager.onSyncStateChange = (isSyncing) => {
      this.emit("syncStateChanged", isSyncing);
    };

    this._isConnected = connectStatus();
    this._startConnectionMonitoring();

    setTimeout(() => {
      this.syncManager.triggerFullSync();
    }, 3000);
    logger.debug("GlobalState initialized");
  }

  _onStorageChange = (data) => {
    this.emit("settingsChange", data);

    if (data.key === "prayerTimes" || data.key?.startsWith("notify:")) {
      logger.debug(`Prayer times changed, rescheduling alarms`);
      this.alarmScheduler.rescheduleAlarms({ force: true });
    }
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
    this._checkConnectionRequirement();
  }

  isConnected() {
    return this._isConnected;
  }

  _startConnectionMonitoring(intervalMs = 2000) {
    this._stopConnectionMonitoring();

    this._connectionCheckInterval = setInterval(() => {
      this._checkConnection();
    }, intervalMs);

    logger.debug("Started connection monitoring");
  }

  _stopConnectionMonitoring() {
    if (this._connectionCheckInterval) {
      clearInterval(this._connectionCheckInterval);
      this._connectionCheckInterval = null;
    }
  }

  _checkConnection() {
    const wasConnected = this._isConnected;
    this._isConnected = connectStatus();

    if (wasConnected !== this._isConnected) {
      logger.debug(`Connection status changed: ${this._isConnected}`);
      this.emit("connectionChanged", this._isConnected);
    }

    this._checkConnectionRequirement();
  }

  _checkConnectionRequirement() {
    if (this._isNavigating) return;

    const requirement = this.getConnectionRequirement();
    const currentPage = this.getCurrentPageName();

    if (!requirement) return;

    if (currentPage === "debug") return;

    if (this._isConnected && currentPage === "connectionRequirement") {
      logger.debug(
        `Connection restored, returning to: ${requirement.returnPage}`
      );
      this._navigateToPage(requirement.returnPage);
    } else if (!this._isConnected && currentPage !== "connectionRequirement") {
      logger.debug(`Connection required, showing connection requirement page`);
      this._navigateToPage("connectionRequirement");
    }
  }

  getConnectionRequirement() {
    return this.storage.getItem("connectionRequired");
  }

  setConnectionRequirement(reason, returnPage) {
    this.storage.setItem(
      "connectionRequired",
      { reason, returnPage },
      { markForPush: false }
    );
  }

  clearConnectionRequirement() {
    this.storage.removeItem("connectionRequired");
  }

  getCurrentPageName() {
    for (const [name, page] of Object.entries(this.pages)) {
      if (page === this.currentPage) return name;
    }
    return null;
  }

  isOnboardingCompleted() {
    return this.storage.hasItem("onboarding_completed");
  }

  completeOnboarding() {
    this.storage.setItem("onboarding_completed", true, { markForPush: false });
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

  destroy() {
    RefreshManager.clear();
    this._stopConnectionMonitoring();

    this.storage?.off("change", this._onStorageChange);
    this.eventBus?.clear();

    Object.values(this.pages).forEach((page) => {
      page?.destroy?.();
    });

    this.syncManager?.destroy();
    this.syncManager = null;

    PrayersService.destroy();

    this.storage?.destroy();
    this.storage = null;

    this.pages = {};
    this.currentPage = null;

    logger.debug("GlobalState destroyed");
  }
}
