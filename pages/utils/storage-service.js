import EasyStorage from "@silver-zepp/easy-storage";
import { EventBus } from "@zos/utils";
import { SYNC_SETTINGS_LIST } from "../../shared/constants";
import { DeviceLogger } from "./device-logger";
import { debounce } from "../../shared/helpers";

const logger = new DeviceLogger("storage-service");

let storage = null;
let eventBus = null;
const SAVE_DELAY = 3000;
const debouncedSave = debounce(() => {
  getStorage().saveAll();
}, SAVE_DELAY);

function getStorage() {
  if (!storage) {
    storage = new EasyStorage();
    storage.SetAutosaveEnable(false);
  }
  return storage;
}

function getEventBus() {
  if (!eventBus) {
    eventBus = new EventBus();
  }
  return eventBus;
}

export class StorageService {
  static on(eventName, listener) {
    getEventBus().on(eventName, listener);
  }

  static off(eventName, listener) {
    getEventBus().off(eventName, listener);
  }

  static emit(eventName, ...args) {
    getEventBus().emit(eventName, ...args);
  }

  static getItem(key, { returnTimestamp = false, stringify = false } = {}) {
    let value = getStorage().getKey(key);

    if (value === undefined || value === null) {
      return returnTimestamp ? { data: value, timestamp: 0 } : value;
    }

    value = JSON.parse(value);

    if (stringify) {
      value.data = JSON.stringify(value.data);
    }

    return returnTimestamp ? value : value.data;
  }

  static setItem(key, value, { timestamp = Date.now(), markForSync = false } = {}) {
    if (value === undefined) {
      logger.warn(`Attempted to set undefined value for key "${key}".`);
      return;
    }

    try {
      const wrappedValue = { data: value, timestamp };
      getStorage().setKey(key, JSON.stringify(wrappedValue));

      this.emit("change", { key, value, timestamp });

      if (markForSync) {
        this._addKeyToPendingPush(key);
      }

      debouncedSave();
    } catch (error) {
      logger.error(`Error setting item for key "${key}":`, error);
    }
  }

  static _addKeyToPendingPush(key) {
    if (!SYNC_SETTINGS_LIST.includes(key)) return;

    try {
      let pending = this.getItem("pendingPush");
      if (!Array.isArray(pending)) pending = [];
      if (!pending.includes(key)) {
        pending.push(key);
        this.setItem("pendingPush", pending);
      }
    } catch (err) {
      logger.error(`Error adding key "${key}" to pendingPush:`, err);
    }
  }

  static hasItem(key) {
    return getStorage().hasKey(key);
  }

  static removeItem(key) {
    if (!getStorage().hasKey(key)) return;
    getStorage().removeKey(key);
  }

  static getAllKeys() {
    return Object.keys(getStorage().getStorageSnapshot());
  }

  static getAllContents() {
    return getStorage().getStorageSnapshot();
  }

  static clear() {
    getStorage().deleteAll();
  }

  static destroy() {
    getEventBus()?.clear();
    getStorage()?.saveAll();
    storage = null;
    eventBus = null;
    if (debouncedSave && debouncedSave.cancel) {
      debouncedSave.cancel();
    }
  }
}
