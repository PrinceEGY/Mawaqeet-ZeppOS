export class StorageService {
  constructor(storage) {
    this.storage = storage;
  }

  getItem(key, returnTimestamp = false, stringify = false) {
    let value = this.storage.getItem(key);

    if (value === undefined || value === null) {
      console.warn(`Key "${key}" not found in storage.`);
      return returnTimestamp ? { data: value, timestamp: 0 } : value;
    }

    console.debug(`Retrieved item for key "${key}":`, value);

    try {
      value = JSON.parse(value);
      if (stringify) value.data = JSON.stringify(value.data);

      return returnTimestamp ? value : value.data;
    } catch (error) {
      console.error(`Error parsing value for key "${key}":`, error);
      return value;
    }
  }

  setItem(key, value, timestamp = Date.now()) {
    if (value === undefined) {
      console.warn(`Attempted to set undefined value for key "${key}".`);
      return;
    }

    try {
      const wrappedValue = {
        data: value,
        timestamp,
      };
      this.storage.setItem(key, JSON.stringify(wrappedValue));
      console.debug(`Set item for key "${key}":`, wrappedValue);
    } catch (error) {
      console.error(`Error setting item for key "${key}":`, error);
    }
  }

  hasItem(key) {
    const keys = this.getAllKeys();
    return keys.includes(key);
  }

  removeItem(key) {
    this.storage.removeItem(key);
    console.debug(`Removed item for key "${key}".`);
  }

  clear() {
    this.storage.clear();
    console.debug("Cleared all items from storage.");
  }

  getAllContents() {
    return this.storage.toObject();
  }

  getAllKeys() {
    return Object.keys(this.getAllContents());
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
