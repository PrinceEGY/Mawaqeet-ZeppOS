import { log as Logger } from "@zos/utils";

const logger = Logger.getLogger("update-manager");

/**
 * UpdateManager - A static update system Providing responsive updates at 30fps (~33ms intervals)
 */
export class UpdateManager {
  static updateCallback = null;
  static updateInterval = null;
  static isRunning = false;

  static setUpdateCallback(callback) {
    if (typeof callback !== "function") {
      logger.error("UpdateManager: Update callback must be a function");
      return;
    }

    this.updateCallback = callback;

    if (!this.isRunning) {
      this.start();
    }

    logger.debug("UpdateManager: Update callback registered");
  }

  static clearUpdateCallback() {
    this.updateCallback = null;

    if (this.isRunning) {
      this.stop();
    }

    logger.debug("UpdateManager: Update callback cleared");
  }

  static start() {
    if (this.isRunning) {
      this.stop();
    }

    this.updateInterval = setInterval(() => {
      this.runUpdate();
    }, 1000 / 30); // 33ms for ~30fps

    this.isRunning = true;
    logger.debug("UpdateManager: Started update loop");
  }

  static stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.isRunning = false;
    logger.debug("UpdateManager: Stopped update loop");
  }

  static runUpdate() {
    if (this.updateCallback) {
      try {
        this.updateCallback();
      } catch (error) {
        logger.error("UpdateManager: Error in update callback:", error);
      }
    }
  }

  static hasUpdateCallback() {
    return this.updateCallback !== null;
  }

  static isUpdateLoopRunning() {
    return this.isRunning;
  }

  static clear() {
    this.clearUpdateCallback();
    this.stop();
    logger.debug("UpdateManager: Cleared");
  }

  static destroy() {
    this.clear();
    logger.debug("UpdateManager: Destroyed");
  }
}
