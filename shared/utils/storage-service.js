export class StorageService {
  constructor(storage) {
    this.storage = storage;
  }

  getItem(key, returnTimestamp = false) {
    let value = this.storage.getItem(key);

    if (value === undefined || value === null) {
      console.warn(`Key "${key}" not found in storage.`);
      return returnTimestamp ? { data: value, timestamp: Date.now() } : value;
    }

    console.debug(`Retrieved item for key "${key}":`, value);
    let parsedValue;
    try {
      parsedValue = JSON.parse(value);
    } catch (error) {
      console.error(`Error parsing value for key "${key}":`, error);
      console.error(`Returning raw value for key "${key}":`, value);
      return returnTimestamp ? { data: value, timestamp: Date.now() } : value;
    }
    return returnTimestamp ? parsedValue : parsedValue.data;
  }

  setItem(key, value) {
    if (value === undefined) {
      console.warn(`Attempted to set undefined value for key "${key}".`);
      return;
    }

    try {
      const wrappedValue = {
        data: value,
        timestamp: Date.now(),
      };
      this.storage.setItem(key, JSON.stringify(wrappedValue));
      console.debug(`Set item for key "${key}":`, wrappedValue);
    } catch (error) {
      console.error(`Error setting item for key "${key}":`, error);
    }
  }

  hasItem(key) {
    const keys = this.storage.getAllKeys();
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
}
