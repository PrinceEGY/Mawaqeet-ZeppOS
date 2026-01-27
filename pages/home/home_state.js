import { EventBus } from "@zos/utils";
import { TIMINGS_LIST } from "../../shared/constants";
import { DateUtils } from "../../shared/utils/date-utils";
import { DeviceLogger } from "../utils/device-logger";
import { PrayersService } from "../utils/prayers-service";

const logger = new DeviceLogger("home-page-state");

export class HomePageState {
  constructor(globalState) {
    this.globalState = globalState;
    this.storage = globalState.storage;
    this.eventBus = new EventBus();
    this.state = {
      currentDate: new Date(),
      prayers: [],
      enabledPrayers: [],
      cachedPrayers: null,
      lastCachedDate: null,
      isDataLoaded: false,
      currentLocation: null,
      hasDataForCurrentDate: true,
      availableDateRange: null,
    };
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

  getCurrentDate() {
    return new Date(this.state.currentDate);
  }

  setCurrentDate(newDate) {
    if (!(newDate instanceof Date) || isNaN(newDate.getTime())) {
      logger.error("Invalid date provided to setCurrentDate");
      return false;
    }

    const oldDate = new Date(this.state.currentDate);
    this.state.currentDate = new Date(newDate);

    if (oldDate.toDateString() !== newDate.toDateString()) {
      this.clearPrayersCache();
      logger.debug(
        `Date changed from ${oldDate.toDateString()} to ${newDate.toDateString()}`
      );
    }

    this.loadPrayers();

    this.emit("dateChange", {
      currentDate: this.getCurrentDate(),
      prayers: this.getPrayers(),
    });

    this.emit("prayersChange", {
      prayers: this.getPrayers(),
    });

    return true;
  }

  getPrayers() {
    if (!this.isPrayersCacheValid()) {
      this.loadPrayers();
    }
    return [...this.state.prayers];
  }

  loadPrayers() {
    try {
      const currentDateString = this.state.currentDate.toDateString();

      if (this.isPrayersCacheValid(currentDateString)) {
        this.state.prayers = [...this.state.cachedPrayers];
        return this.state.prayers;
      }

      this.state.availableDateRange =
        PrayersService.getEffectiveAvailableDateRange();

      const isDateValid = PrayersService.isDateInValidRange(
        this.state.currentDate
      );
      const prayerTimes = isDateValid ? this.fetchPrayerTimes() : null;

      if (!prayerTimes?.timings) {
        this.state.hasDataForCurrentDate = false;
        this.state.prayers = [];
      } else {
        this.state.hasDataForCurrentDate = true;
        this.state.prayers = this._buildPrayersForCurrentDate(prayerTimes);
      }

      this.cachePrayers(this.state.prayers, currentDateString);
      return this.state.prayers;
    } catch (error) {
      logger.error(`Error loading prayers: ${error}`);
      this.state.prayers = [];
      return this.state.prayers;
    }
  }

  _buildPrayersForCurrentDate(prayerTimes) {
    const now = new Date();
    const nextPrayer = PrayersService.getNextPrayerTime(
      this.state.currentDate,
      now,
      this.state.enabledPrayers
    );
    return this.buildPrayersList(prayerTimes.timings, now, nextPrayer);
  }

  fetchPrayerTimes() {
    const isToday = DateUtils.isDateToday(this.state.currentDate);
    return isToday
      ? PrayersService.getEffectiveDayPrayerTimes(this.state.currentDate)
      : PrayersService.getDayPrayerTimes(this.state.currentDate);
  }

  buildPrayersList(timings, now, nextPrayer) {
    const prayers = [];

    Object.entries(timings).forEach(([prayerName, prayerTime]) => {
      if (!this.state.enabledPrayers.includes(prayerName)) return;
      if (!prayerTime) return;

      const prayerTimestamp = new Date(prayerTime);
      const status = this.getPrayerStatus(
        prayerTimestamp,
        now,
        nextPrayer,
        prayerTime
      );

      prayers.push({
        name: prayerName,
        time: DateUtils.formatCurrentTime(prayerTimestamp, false),
        timestamp: prayerTimestamp,
        status,
      });
    });

    return prayers;
  }

  getPrayerStatus(prayerTimestamp, now, nextPrayer, prayerTime) {
    if (prayerTimestamp <= now) {
      return "passed";
    }
    if (nextPrayer?.time === prayerTime) {
      return "next";
    }
    return "upcoming";
  }

  getEnabledPrayers() {
    return [...this.state.enabledPrayers];
  }

  hasDataForCurrentDate() {
    return this.state.hasDataForCurrentDate;
  }

  getAvailableDateRange() {
    return this.state.availableDateRange;
  }

  getCurrentLocation() {
    return this.state.currentLocation || "Unknown";
  }

  loadCurrentLocation() {
    try {
      const location = this.storage.getItem("currentLocation");
      const newLocation = location || "Unknown";
      const oldCity = this.state.currentLocation?.city;
      const newCity = newLocation?.city;

      this.state.currentLocation = newLocation;

      if (oldCity !== newCity) {
        this.emit("locationChange", { location: newLocation });
      }
    } catch (error) {
      this.state.currentLocation = "Unknown";
      logger.error(`Failed to load location: ${error}`);
    }
  }

  updateEnabledPrayers() {
    const enabledPrayers = [];
    TIMINGS_LIST.forEach((timing) => {
      const displaySetting = this.storage.getItem(`display:${timing.name}`);
      if (displaySetting !== false) {
        enabledPrayers.push(timing.name);
      }
    });

    this.state.enabledPrayers = enabledPrayers;
    this.clearPrayersCache();
  }

  isPrayersCacheValid(dateString) {
    return this.state.cachedPrayers && this.state.lastCachedDate === dateString;
  }

  cachePrayers(prayers, dateString) {
    this.state.cachedPrayers = [...prayers];
    this.state.lastCachedDate = dateString;
  }

  clearPrayersCache() {
    if (!this.state) return;
    this.state.cachedPrayers = null;
    this.state.lastCachedDate = null;
  }

  destroy() {
    this.eventBus?.clear();
    this.eventBus = null;
    this.clearPrayersCache();
    this.state = null;
    this.globalState = null;
    this.storage = null;
    logger.debug("HomePageState destroyed");
  }
}
