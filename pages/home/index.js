import { BasePage } from "@zeppos/zml/base-page";
import * as hmUI from "@zos/ui";
import { log as Logger, px } from "@zos/utils";
import {
  PRAYER_ICONS,
  TIMINGS_LIST,
  getPrayerLabel,
} from "../../shared/constants";
import { DateUtils } from "../../shared/utils/date-utils";
import { PrayersService } from "../utils/prayers-service";
import { StorageService } from "../utils/storage-service";
import { SyncManager } from "../utils/sync-manager";
import { UpdateManager } from "../utils/update-manager";
import { PRAYER_STATUS_COLORS, UI_BUILDERS } from "./index.r.layout";

const logger = Logger.getLogger("home-page");

const storage = new StorageService();
let syncManager = null;

Page(
  BasePage({
    state: {
      currentDate: new Date(),
      dateWidget: null,
      timeWidget: null,
      prayersContainer: null,
      prayerComponents: [],
      cachedEffectivePrayers: null,
      lastCalculatedDate: null,
      enabledPrayers: [],
    },

    onInit() {
      logger.debug("Home page initialized");
      this.updateEnabledPrayersList();
      syncManager = new SyncManager(this.request.bind(this));
      syncManager.triggerSync();
      UpdateManager.setUpdateCallback(this.refresh.bind(this));
    },

    build() {
      const currentLocation = storage.getItem("currentLocation");

      const mainContainer = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
        scroll_enable: 0,
      });

      const infoGroup = mainContainer.createWidget(hmUI.widget.GROUP, {
        y: px(10),
      });

      UI_BUILDERS.createCityText(infoGroup, currentLocation);

      UI_BUILDERS.createLeftArrow(infoGroup, () => {
        this.navigateToPreviousDay();
      });

      UI_BUILDERS.createRightArrow(infoGroup, () => {
        this.navigateToNextDay();
      });

      const dateParts = DateUtils.formatGregorianDate(this.state.currentDate);
      this.state.dateWidget = UI_BUILDERS.createDateText(
        infoGroup,
        `${dateParts.getDayName()}\n${dateParts.getDateOnly()}`
      );

      this.state.timeWidget = UI_BUILDERS.createTimeText(
        infoGroup,
        DateUtils.formatCurrentTime()
      );

      this.state.prayersContainer =
        UI_BUILDERS.createPrayersContainer(mainContainer);
      this.buildPrayersUI();
    },

    onRequest(req, res) {
      logger.debug("onRequest invoked", req.method);
      res(null, { status: "success" });
    },

    onCall(req) {
      logger.debug("onCall invoked", req.method);
      if (req.method === "sync.triggerSync") {
        syncManager.triggerSync(req.keys);
      }
    },

    onDestroy() {
      UpdateManager.destroy();
    },

    refresh() {
      try {
        this.updateTime();
        this.updatePrayersRemaining();
      } catch (error) {
        logger.error(`Error in refresh callback: ${error}`);
      }
    },

    getPrayerTimes() {
      try {
        const currentDateString = this.state.currentDate.toDateString();

        if (this.isCacheValid(currentDateString)) {
          return this.state.cachedEffectivePrayers;
        }

        const now = new Date();
        const isToday = this.isCurrentDateToday();

        const prayerTimes = this.fetchPrayerTimes(isToday);
        if (!prayerTimes || !prayerTimes.timings) {
          return this.cacheAndReturn([], currentDateString);
        }

        const nextPrayer = isToday
          ? PrayersService.getNextPrayerTime(
              this.state.currentDate,
              now,
              this.state.enabledPrayers
            )
          : null;
        const prayers = this.buildPrayersList(
          prayerTimes.timings,
          now,
          nextPrayer
        );

        return this.cacheAndReturn(prayers, currentDateString);
      } catch (error) {
        logger.error(`Error getting effective prayers: ${error}`);
        return [];
      }
    },

    isCurrentDateToday() {
      const currentDateString = this.state.currentDate.toDateString();
      const now = new Date();
      return currentDateString === now.toDateString();
    },

    fetchPrayerTimes() {
      const isToday = this.isCurrentDateToday();
      return isToday
        ? PrayersService.getEffectiveDayPrayerTimes(this.state.currentDate)
        : PrayersService.getDayPrayerTimes(this.state.currentDate);
    },

    buildPrayersList(timings, now, nextPrayer) {
      const prayers = [];

      TIMINGS_LIST.forEach((timing) => {
        if (!this.state.enabledPrayers.includes(timing.name)) return;

        const prayerTime = timings[timing.name];
        if (!prayerTime) return;

        const prayerTimestamp = new Date(prayerTime);
        const status = this.getPrayerStatus(
          prayerTimestamp,
          now,
          nextPrayer,
          prayerTime
        );

        prayers.push({
          name: timing.name,
          time: DateUtils.formatCurrentTime(prayerTimestamp, false),
          remaining: this.calculateTimeRemaining(prayerTime, now),
          timestamp: prayerTimestamp,
          status,
        });
      });

      return prayers;
    },

    getPrayerStatus(prayerTimestamp, now, nextPrayer, prayerTime) {
      if (prayerTimestamp <= now) {
        return "passed";
      }
      if (nextPrayer?.time === prayerTime) {
        return "next";
      }
      return "upcoming";
    },

    updateEnabledPrayersList() {
      const enabledPrayers = [];
      TIMINGS_LIST.forEach((timing) => {
        const displaySetting = storage.getItem(`display:${timing.name}`);
        if (displaySetting !== false) {
          enabledPrayers.push(timing.name);
        }
      });
      this.state.enabledPrayers = enabledPrayers;
    },

    calculateTimeRemaining(prayerTimestamp, now) {
      try {
        const prayerTime = new Date(prayerTimestamp);
        const timeDiff = prayerTime - now;

        if (timeDiff <= 0) {
          return "--:--:--";
        }

        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        const hoursStr = hours.toString().padStart(2, "0");
        const minutesStr = minutes.toString().padStart(2, "0");
        const secondsStr = seconds.toString().padStart(2, "0");

        return `${hoursStr}:${minutesStr}:${secondsStr}`;
      } catch (error) {
        logger.error(`Error calculating time remaining: ${error}`);
        return "--:--:--";
      }
    },

    isCacheValid(currentDateString) {
      return (
        this.state.cachedEffectivePrayers &&
        this.state.lastCalculatedDate === currentDateString
      );
    },

    cacheAndReturn(prayers, dateString) {
      this.state.cachedEffectivePrayers = prayers;
      this.state.lastCalculatedDate = dateString;
      return prayers;
    },

    clearPrayersCache() {
      this.state.cachedEffectivePrayers = null;
      this.state.lastCalculatedDate = null;
    },

    buildPrayersUI() {
      const effectivePrayers = this.getPrayerTimes();
      if (!effectivePrayers || effectivePrayers.length === 0) {
        logger.debug("No effective prayers found for current date");
        return;
      }

      if (this.state.prayerComponents.length === 0) {
        let yOffset = 0;
        effectivePrayers.forEach((prayer) => {
          const prayerComponent = UI_BUILDERS.createPrayerItem(
            this.state.prayersContainer,
            prayer,
            yOffset
          );
          this.state.prayerComponents.push(prayerComponent);
          yOffset += 80;
        });

        UI_BUILDERS.createSpacer(this.state.prayersContainer, {
          y: yOffset,
          w: px(10),
          h: px(150),
        });
      } else {
        effectivePrayers.forEach((prayer, index) => {
          const component = this.state.prayerComponents[index];
          if (component) {
            this.updatePrayerComponent(component, prayer);
          }
        });
      }
    },

    updatePrayerComponent(component, prayer) {
      const colors =
        PRAYER_STATUS_COLORS[prayer.status] || PRAYER_STATUS_COLORS.upcoming;

      this.updateComponentProperty(
        component.name,
        hmUI.prop.TEXT,
        getPrayerLabel(prayer.name)
      );
      this.updateComponentProperty(
        component.name,
        hmUI.prop.COLOR,
        colors.name
      );

      this.updateComponentProperty(component.time, hmUI.prop.TEXT, prayer.time);
      this.updateComponentProperty(
        component.time,
        hmUI.prop.COLOR,
        colors.time
      );

      this.updateComponentProperty(
        component.remaining,
        hmUI.prop.TEXT,
        prayer.remaining
      );
      this.updateComponentProperty(
        component.remaining,
        hmUI.prop.COLOR,
        colors.remaining
      );

      const iconPath = PRAYER_ICONS[prayer.name] || PRAYER_ICONS.fajr;
      this.updateComponentProperty(component.icon, hmUI.prop.SRC, iconPath);
    },

    updateComponentProperty(widget, property, value) {
      try {
        if (widget) {
          widget.setProperty(property, value);
        }
      } catch (error) {
        logger.error(`Error updating component property: ${error}`);
      }
    },

    updateDateDisplay() {
      const dateParts = DateUtils.formatGregorianDate(this.state.currentDate);
      const dateText = `${dateParts.getDayName()}\n${dateParts.getDateOnly()}`;

      this.updateComponentProperty(
        this.state.dateWidget,
        hmUI.prop.TEXT,
        dateText
      );
    },

    updateTime() {
      try {
        if (this.state.timeWidget) {
          this.state.timeWidget.setProperty(
            hmUI.prop.TEXT,
            DateUtils.formatCurrentTime()
          );
        }
      } catch (error) {
        logger.error(`Error in updateTime: ${error}`);
      }
    },

    updatePrayersRemaining() {
      try {
        const now = new Date();

        if (!this.hasValidPrayerData()) {
          return;
        }

        this.state.prayerComponents.forEach((component, index) => {
          const prayerData = this.state.cachedEffectivePrayers[index];
          if (prayerData) {
            const newRemaining = this.calculateTimeRemaining(
              prayerData.timestamp,
              now
            );
            this.updateComponentProperty(
              component.remaining,
              hmUI.prop.TEXT,
              newRemaining
            );
          }
        });
      } catch (error) {
        logger.error(`Error in updatePrayersRemaining: ${error}`);
      }
    },

    navigateToPreviousDay() {
      this.navigateByDays(-1);
    },

    navigateToNextDay() {
      this.navigateByDays(1);
    },

    navigateByDays(days) {
      const newDate = new Date(this.state.currentDate);
      newDate.setDate(newDate.getDate() + days);
      this.changeDate(newDate);
    },

    changeDate(newDate) {
      this.state.currentDate = new Date(newDate);
      this.clearPrayersCache();
      this.updateDateDisplay();
      this.buildPrayersUI();

      const dateParts = DateUtils.formatGregorianDate(this.state.currentDate);
      logger.debug(`Date changed to: ${dateParts.getFullDate()}`);
    },

    hasValidPrayerData() {
      return (
        this.state.prayerComponents?.length > 0 &&
        this.state.cachedEffectivePrayers
      );
    },
  })
);
