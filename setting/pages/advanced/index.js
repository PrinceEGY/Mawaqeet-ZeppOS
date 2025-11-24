import { gettext } from "i18n";
import { DEFAULT_SETTINGS } from "../../../shared/constants.js";
import { DateUtils } from "../../../shared/utils/date-utils.js";
import { PrayersService } from "../../../shared/utils/prayers-service.js";
import { SettingInitializer } from "../../../shared/utils/setting-init.js";
import { AppBar } from "../../components/app_bar";
import { Input } from "../../components/input";
import { Panel } from "../../components/panel";
import { Spacer } from "../../components/spacer";
import {
  BUTTON_STYLES,
  LAYOUT_STYLES,
  SPACING,
  TEXT_STYLES,
} from "../../utils/styles";

export function advancedSettingsPage(navigateBackCallback, props) {
  const prayersService = new PrayersService(props.storageService);
  const fetchMetaData = props.storageService.getItem("fetchMetaData");
  const lastUpdateText = DateUtils.getTimeAgo(fetchMetaData.fetchDate);

  return Section({ style: LAYOUT_STYLES.mainContainer }, [
    AppBar({
      title: gettext("advanced_settings"),
      onBack: navigateBackCallback,
      showBackButton: true,
    }),

    Spacer({ height: SPACING.sm }),

    buildUpdatePanel(lastUpdateText),

    Spacer({ height: SPACING.xs }),

    buildFetchWindowPanel(props),

    Spacer({ height: SPACING.xs }),

    buildAutoFetchPanel(props),

    Spacer({ height: SPACING.xs }),

    buildManualSyncPanel(props),

    Spacer({ height: SPACING.xs }),

    buildResetSettingsPanel(props),

    Spacer({ height: SPACING.md }),
  ]);

  // --- Helper Methods ---
  function validateMonthsInput(value) {
    const numValue = parseInt(value);

    if (isNaN(numValue)) {
      return DEFAULT_SETTINGS.fetching.monthsBefore;
    }

    const { monthsMin, monthsMax } = DEFAULT_SETTINGS.fetching;
    return Math.max(monthsMin, Math.min(monthsMax, numValue));
  }

  function validateFetchIntervalInput(value) {
    const numValue = parseInt(value);

    if (isNaN(numValue)) {
      return DEFAULT_SETTINGS.fetching.autoFetchInterval;
    }

    const { monthsMax } = DEFAULT_SETTINGS.fetching;
    const maxDays = monthsMax * 30 - 1;
    return Math.max(1, Math.min(maxDays, numValue));
  }

  // --- Build Methods ---
  function buildUpdatePanel(lastUpdateText) {
    return Panel({
      children: [
        Text(
          {
            style: {
              ...TEXT_STYLES.subheading,
              marginBottom: SPACING.xs,
            },
          },
          gettext("last_update")
        ),
        Text(
          {
            style: {
              ...TEXT_STYLES.normal,
              marginBottom: SPACING.xs,
            },
          },
          lastUpdateText || gettext("never_updated")
        ),
        Text(
          {
            style: {
              ...TEXT_STYLES.small,
              marginBottom: SPACING.md,
            },
          },
          gettext("prayer_update_desc")
        ),
        Button({
          label: gettext("manual_update"),
          style: { ...BUTTON_STYLES.primary },
          onClick: () => {
            prayersService.fetchAndSavePrayerTimes();
          },
        }),
      ],
    });
  }

  function buildFetchWindowPanel(props) {
    const fetchMetaData = props.storageService.getItem("fetchMetaData");
    const monthsBefore = fetchMetaData.beforeMonths;
    const monthsAfter = fetchMetaData.afterMonths;

    return Panel({
      children: [
        Text(
          {
            style: {
              ...TEXT_STYLES.subheading,
              marginBottom: SPACING.xs,
            },
          },
          gettext("fetch_window_size")
        ),
        Text(
          {
            style: {
              ...TEXT_STYLES.small,
              marginBottom: SPACING.md,
            },
          },
          gettext("fetch_window_desc")
        ),

        Input({
          label: gettext("months_before"),
          value: monthsBefore,
          onChange: (value) => {
            const validatedValue = validateMonthsInput(value);
            const updatedFetchMetaData = {
              ...fetchMetaData,
              beforeMonths: validatedValue,
            };
            props.storageService.setItem("fetchMetaData", updatedFetchMetaData);
          },
        }),

        Input({
          label: gettext("months_after"),
          value: monthsAfter,
          onChange: (value) => {
            const validatedValue = validateMonthsInput(value);
            const updatedFetchMetaData = {
              ...fetchMetaData,
              afterMonths: validatedValue,
            };
            props.storageService.setItem("fetchMetaData", updatedFetchMetaData);
          },
        }),
      ],
    });
  }

  function buildAutoFetchPanel(props) {
    const fetchMetaData = props.storageService.getItem("fetchMetaData");
    const autoFetchInterval = fetchMetaData.autoFetchInterval;

    return Panel({
      children: [
        Text(
          {
            style: {
              ...TEXT_STYLES.subheading,
              marginBottom: SPACING.xs,
            },
          },
          gettext("auto_fetch_interval")
        ),
        Text(
          {
            style: {
              ...TEXT_STYLES.small,
              marginBottom: SPACING.md,
            },
          },
          gettext("auto_fetch_interval_desc")
        ),

        Input({
          label: gettext("days_between_updates"),
          value: autoFetchInterval,
          onChange: (value) => {
            const validatedValue = validateFetchIntervalInput(value);
            const updatedFetchMetaData = {
              ...fetchMetaData,
              autoFetchInterval: validatedValue,
            };
            props.storageService.setItem("fetchMetaData", updatedFetchMetaData);
          },
        }),
      ],
    });
  }

  function buildManualSyncPanel(props) {
    return Panel({
      children: [
        Text(
          {
            style: {
              ...TEXT_STYLES.subheading,
              marginBottom: SPACING.xs,
            },
          },
          gettext("manual_sync")
        ),
        Text(
          {
            style: {
              ...TEXT_STYLES.small,
              marginBottom: SPACING.md,
            },
          },
          gettext("manual_sync_desc")
        ),
        Button({
          label: gettext("manual_sync_btn"),
          style: { ...BUTTON_STYLES.primary },
          onClick: () => {
            props.storageService.setItem("triggerFullSync", true);
          },
        }),
      ],
    });
  }

  function buildResetSettingsPanel(props) {
    return Panel({
      children: [
        Text(
          {
            style: {
              ...TEXT_STYLES.subheading,
              marginBottom: SPACING.xs,
            },
          },
          gettext("reset_default_settings")
        ),
        Text(
          {
            style: {
              ...TEXT_STYLES.small,
              marginBottom: SPACING.md,
            },
          },
          gettext("calc_method_page_desc")
        ),
        Button({
          label: gettext("reset_settings_btn"),
          style: { ...BUTTON_STYLES.primary },
          onClick: () => {
            props.storageService.clear();
            SettingInitializer.resetSessionFlag();
            SettingInitializer.initDefaultSettings(props.storageService);
            console.log("Settings reset to default.");
          },
        }),
      ],
    });
  }
}
