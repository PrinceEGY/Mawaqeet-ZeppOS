import { EventBus } from "@zos/utils";
import { debounce } from "../shared/helpers";
import { DeviceLogger } from "./utils/device-logger";
import { PrayersService } from "./utils/prayers-service";
import { RefreshManager } from "./utils/refresh-manager";
import { StorageService } from "./utils/storage-service";
import { SyncManager } from "./utils/sync-manager";

const logger = new DeviceLogger("global-state");

export class GlobalState {
  constructor(request, call) {
    this.storage = new StorageService();
    this.eventBus = new EventBus();
    this.syncManager = new SyncManager(request, call, this.storage);
    this.currentPage = null;
    this.pages = {};
    this.debouncedEmitSettingsChange = null;
  }

  init() {
    this.debouncedEmitSettingsChange = debounce(() => {
      logger.debug("Emitting settingsChange");
      this.emit("settingsChange");
    }, 2000);

    this.storage.on("change", this.debouncedEmitSettingsChange);
    RefreshManager.setRefreshCallback(() => this.emit("refresh"));

    setTimeout(() => {
      this.syncManager.triggerFullSync();
    }, 3000);
    logger.debug("GlobalState initialized");
  }

  registerPage(name, pageInstance) {
    this.pages[name] = pageInstance;
    logger.debug(`Page registered: ${name}`);
  }

  navigate(pageName) {
    if (!this.pages[pageName]) {
      logger.error(`Page not found: ${pageName}`);
      return;
    }

    if (this.currentPage) {
      this.currentPage.hide();
    }

    const page = this.pages[pageName];
    if (!page.isBuilt) {
      page.init();
      page.build();
    }
    page.show();
    this.currentPage = page;
    logger.debug(`Navigated to: ${pageName}`);
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

    if (this.debouncedEmitSettingsChange) {
      this.debouncedEmitSettingsChange.cancel();
    }
    this.storage.off("change", this.debouncedEmitSettingsChange);
    this.eventBus.clear();

    Object.values(this.pages).forEach((page) => {
      if (page.destroy) {
        page.destroy();
      }
    });

    if (this.syncManager) {
      this.syncManager.destroy();
      this.syncManager = null;
    }

    PrayersService.destroy();

    this.storage.destroy();
    this.storage = null;

    this.pages = {};
    this.currentPage = null;
    this.debouncedEmitSettingsChange = null;

    logger.debug("GlobalState destroyed");
  }
}
