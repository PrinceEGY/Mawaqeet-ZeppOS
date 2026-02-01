import { DeviceLogger } from "./device-logger";

const logger = new DeviceLogger("refresh-manager");

const TARGET_FPS = 15;
const REFRESH_INTERVAL = 1000 / TARGET_FPS;

/**
 * RefreshManager - A static refresh system Providing responsive updates at configurable fps.
 */
export class RefreshManager {
  static refreshCallback = null;
  static refreshInterval = null;
  static isRunning = false;

  static setRefreshCallback(callback) {
    if (typeof callback !== "function") {
      logger.error("RefreshManager: Refresh callback must be a function");
      return;
    }

    if (this.refreshCallback) {
      logger.warn("RefreshManager: Overwriting existing callback");
    }

    this.refreshCallback = callback;

    if (!this.isRunning) {
      this.start();
    }

    logger.debug("RefreshManager: Refresh callback registered");
  }

  static clearRefreshCallback() {
    this.refreshCallback = null;

    if (this.isRunning) {
      this.stop();
    }

    logger.debug("RefreshManager: Refresh callback cleared");
  }

  static start() {
    if (this.isRunning) {
      this.stop();
    }

    this.refreshInterval = setInterval(() => {
      this.runRefresh();
    }, REFRESH_INTERVAL);

    this.isRunning = true;
    logger.debug("RefreshManager: Started refresh loop");
  }

  static stop() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    this.isRunning = false;
    logger.debug("RefreshManager: Stopped refresh loop");
  }

  static runRefresh() {
    if (this.refreshCallback) {
      try {
        this.refreshCallback();
      } catch (error) {
        logger.error("RefreshManager: Error in refresh callback:", error);
      }
    }
  }

  static isRefreshLoopRunning() {
    return this.isRunning;
  }

  static clear() {
    this.clearRefreshCallback();
    this.stop();
    logger.debug("RefreshManager: Cleared");
  }
}
