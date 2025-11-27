import EasyStorage, { EasyFlashStorage } from "@silver-zepp/easy-storage";
import { EventBus } from "@zos/utils";
import { SYNC_SETTINGS_LIST } from "../../shared/constants";
import { DeviceLogger } from "./device-logger";

const logger = new DeviceLogger("storage-service");

export class StorageService {
  /**
   * Initializes a storage service with the specified type and directory.
   *
   * Available types:
   * - "memory": Uses `EasyStorage`, Ideal for small-scale data, which stores data permanently on the device. The entire database remains in RAM and the filesystem.
   * - "file": Uses `EasyFlashStorage`, a filesystem-based storage solution for large or persistent data.
   *
   * @param {string} [type="memory"] - The type of storage to use. Can be "memory" or "file".
   * @param {string} [directory] - The directory or filename for storage. If not provided or invalid, defaults are used.
   */
  constructor(type = "memory", directory) {
    this.type = this.validateStorageType(type);
    this.storage = this.initializeStorage(this.type, directory);
    this.eventBus = new EventBus();
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

  validateStorageType(type) {
    const validTypes = ["memory", "file"];
    if (typeof type !== "string" || !validTypes.includes(type)) {
      logger.warn(
        `Invalid storage type "${type}" specified. Defaulting to "memory" storage.`
      );
      return "memory";
    }
    return type;
  }

  initializeStorage(type, directory) {
    if (typeof directory !== "string") {
      directory = undefined;
    }

    if (type === "file") {
      return new EasyFlashStorage(directory);
    }

    if (typeof directory === "string" && !directory.endsWith(".json")) {
      directory += ".json";
    }
    return new EasyStorage(directory);
  }

  getItem(key, { returnTimestamp = false, stringify = false } = {}) {
    let value = this.storage.getKey(key);

    if (value === undefined || value === null) {
      logger.warn(`Key "${key}" not found in storage.`);
      return returnTimestamp ? { data: value, timestamp: 0 } : value;
    }

    if (this.type === "memory") {
      value = JSON.parse(value);
    }

    if (stringify) {
      value.data = JSON.stringify(value.data);
    }

    return returnTimestamp ? value : value.data;
  }

  setItem(key, value, { timestamp = Date.now(), markForPush = true } = {}) {
    if (value === undefined) {
      logger.warn(`Attempted to set undefined value for key "${key}".`);
      return;
    }

    try {
      const wrappedValue = { data: value, timestamp };
      const finalValue =
        this.type === "memory" ? JSON.stringify(wrappedValue) : wrappedValue;

      this.storage.setKey(key, finalValue);
      logger.debug(`Set item for key "${key}":`, finalValue);

      this.emit("change", { key, value, timestamp });

      if (markForPush) {
        this._addKeyToPendingPush(key);
      }
    } catch (error) {
      logger.error(`Error setting item for key "${key}":`, error);
    }
  }

  _addKeyToPendingPush(key) {
    try {
      if (!SYNC_SETTINGS_LIST.includes(key)) return;

      let pending = this.getItem("pendingPush");
      if (!Array.isArray(pending)) pending = [];
      logger.debug("Current pendingPush keys:", pending);
      if (!pending.includes(key)) {
        pending.push(key);
        this.setItem("pendingPush", pending);
      }
    } catch (err) {
      logger.error(`Error adding key "${key}" to pendingPush:`, err);
    }
  }

  hasItem(key) {
    return this.storage.hasKey(key);
  }

  removeItem(key) {
    if (!this.storage.hasKey(key)) {
      logger.warn(`Key "${key}" does not exist in storage.`);
      return;
    }

    this.storage.removeKey(key);
  }

  getAllKeys() {
    return this.type === "memory"
      ? Object.keys(this.storage.getStorageSnapshot())
      : this.storage.getAllKeys();
  }

  getAllContents() {
    return this.storage.getStorageSnapshot();
  }

  clear() {
    this.storage.deleteAll();
    logger.debug("All items cleared from storage.");
  }

  getStorageType() {
    return this.type;
  }

  isKeyOutdated(key, intervalMs) {
    const item = this.getItem(key, { returnTimestamp: true });
    if (!item?.data || !item.timestamp) {
      return true;
    }

    const currentTime = Date.now();
    const elapsedTime = currentTime - item.timestamp;
    return elapsedTime > intervalMs;
  }

  destroy() {
    this.eventBus.clear();

    if (this.type === "memory" && this.storage.saveAll) {
      this.storage.saveAll();
    }

    this.storage = null;
    this.eventBus = null;
  }
}
