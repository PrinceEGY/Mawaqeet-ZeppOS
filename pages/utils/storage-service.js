import EasyStorage, { EasyFlashStorage } from "@silver-zepp/easy-storage";
import { log as Logger } from "@zos/utils";

const logger = Logger.getLogger("storage-service");

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
    if (typeof type !== "string" || !["memory", "file"].includes(type)) {
      logger.warn(
        `Invalid storage type "${type}" specified. Defaulting to "memory" storage.`
      );
      type = "memory";
    }
    this.type = type;

    if (typeof directory !== "string") directory = undefined;

    if (type === "file") {
      this.storage = new EasyFlashStorage(directory);
      return;
    } else if (type === "memory") {
      if (typeof directory === "string" && !directory.endsWith(".json"))
        directory += ".json";
      this.storage = new EasyStorage(directory);
    }
  }

  getItem(key, returnTimestamp = false, stringify = false) {
    let value = this.storage.getKey(key);

    if (value === undefined || value === null) {
      logger.warn(`Key "${key}" not found in storage.`);
      return returnTimestamp ? { data: value, timestamp: 0 } : value;
    }

    logger.debug(`Retrieved item for key "${key}":`, value);

    if (this.type === "memory") value = JSON.parse(value);

    if (stringify) value.data = JSON.stringify(value.data);

    return returnTimestamp ? value : value.data;
  }

  setItem(key, value, timestamp = Date.now()) {
    if (value === undefined) {
      logger.warn(`Attempted to set undefined value for key "${key}".`);
      return;
    }

    // TODO: sync items with settings app
    try {
      let wrappedValue = {
        data: value,
        timestamp: timestamp,
      };

      if (this.type === "memory") wrappedValue = JSON.stringify(wrappedValue);

      this.storage.setKey(key, wrappedValue);
      logger.debug(`Set item for key "${key}":`, wrappedValue);
    } catch (error) {
      logger.error(`Error setting item for key "${key}":`, error);
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
    if (this.type === "memory") {
      return Object.keys(this.storage.getStorageSnapshot());
    }

    return this.storage.getAllKeys();
  }

  getAllContents() {
    const contents = this.storage.getStorageSnapshot();
    return contents;
  }

  clear() {
    this.storage.deleteAll();
    logger.info("All items cleared from storage.");
  }

  getStorageType() {
    return this.type;
  }

  isKeyOutdated(key, intervalMs) {
    const item = this.getItem(key, true);
    if (!item || !item.data || !item.timestamp) {
      return true;
    }

    const currentTime = Date.now();
    const elapsedTime = currentTime - item.timestamp;
    return elapsedTime > intervalMs;
  }
}
