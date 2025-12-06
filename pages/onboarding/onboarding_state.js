import { EventBus } from "@zos/utils";
import { DeviceLogger } from "../utils/device-logger";
import { PrayersService } from "../utils/prayers-service";

const logger = new DeviceLogger("onboarding-state");

export class OnboardingPageState {
  constructor(globalState) {
    this.globalState = globalState;
    this.storage = globalState.storage;
    this.eventBus = new EventBus();

    this.state = {
      currentPageIndex: 0,
      totalPages: 3,
      isAllRequirementsValid: false,
      requirementsStatus: null,
      isSyncDisabled: false,
    };

    this.syncCheckInterval = null;
    this.validateRequiredSettings();
  }

  on(eventName, listener) {
    this.eventBus?.on(eventName, listener);
  }

  off(eventName, listener) {
    this.eventBus?.off(eventName, listener);
  }

  emit(eventName, ...args) {
    this.eventBus?.emit(eventName, ...args);
  }

  get isAllRequirementsValid() {
    return this.state.isAllRequirementsValid;
  }

  get requirementsStatus() {
    return this.state.requirementsStatus;
  }

  getCurrentPageIndex() {
    return this.state.currentPageIndex;
  }

  getTotalPages() {
    return this.state.totalPages;
  }

  canNavigateLeft() {
    return this.state.currentPageIndex > 0;
  }

  canNavigateRight() {
    return this.state.currentPageIndex < this.state.totalPages - 1;
  }

  get isSyncDisabled() {
    return this.state.isSyncDisabled;
  }

  triggerSync() {
    if (this.state.isSyncDisabled || this.state.isAllRequirementsValid) return;

    const syncManager = this.globalState.syncManager;
    if (!syncManager) return;

    this.state.isSyncDisabled = true;
    this.emit("syncStateChanged", true);

    syncManager.pullFromSettingApp();

    this.syncCheckInterval = setInterval(() => {
      if (!syncManager.isSyncing()) {
        clearInterval(this.syncCheckInterval);
        this.syncCheckInterval = null;
        this.state.isSyncDisabled = false;
        this.emit("syncStateChanged", false);
      }
    }, 200);
  }

  setCurrentPageIndex(pageIndex) {
    if (pageIndex >= 0 && pageIndex < this.state.totalPages) {
      this.state.currentPageIndex = pageIndex;
      this.emit("pageChanged", pageIndex);
      logger.debug(`Page changed to: ${pageIndex}`);
    }
  }

  validateRequiredSettings() {
    const requirements = {
      location: this._validateLocation(),
      prayerTimes: this._validatePrayerTimes(),
    };

    const allValid = Object.values(requirements).every((req) => req.isValid);

    this.state.isAllRequirementsValid = allValid;
    this.state.requirementsStatus = requirements;

    this.emit("settingsValidation", { isValid: allValid, requirements });
    logger.debug(`Requirements validated: ${allValid}`);
  }

  _validateLocation() {
    try {
      const location = this.storage.getItem("currentLocation");
      const isValid =
        location &&
        typeof location === "object" &&
        location.city &&
        location.country;

      return {
        isValid,
        message: isValid
          ? `${location.city}, ${location.country}`
          : "Location not set",
      };
    } catch (error) {
      logger.error("Error validating location:", error);
      return { isValid: false, message: "Location not set" };
    }
  }

  _validatePrayerTimes() {
    try {
      const hasData = PrayersService.hasPrayerTimesData();
      const todayPrayers = PrayersService.getDayPrayerTimes(new Date());
      const isValid = hasData && todayPrayers && todayPrayers.timings;

      return {
        isValid,
        message: isValid ? "Set" : "Not set",
      };
    } catch (error) {
      logger.error("Error validating prayer times:", error);
      return { isValid: false, message: "Not set" };
    }
  }

  destroy() {
    if (this.syncCheckInterval) {
      clearInterval(this.syncCheckInterval);
      this.syncCheckInterval = null;
    }
    if (this.eventBus) {
      this.eventBus.clear();
      this.eventBus = null;
    }
    this.state = null;
    this.globalState = null;
    this.storage = null;
    logger.debug("OnboardingPageState destroyed");
  }
}
