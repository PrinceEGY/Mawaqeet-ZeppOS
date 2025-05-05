import { gettext } from "i18n";
import { DEFAULT_SETTINGS } from "../../../shared/constants.js";
import {
  fetchAndSavePrayerTimes,
  getTimeAgo,
} from "../../../shared/helpers.js";
import { AppBar } from "../../components/app_bar";
import { Input } from "../../components/input";
import { Panel } from "../../components/panel";
import { Spacer } from "../../components/spacer";
import { SettingInitializer } from "../../utils/setting-init.js";
import {
  BUTTON_STYLES,
  LAYOUT_STYLES,
  SPACING,
  TEXT_STYLES,
} from "../../utils/styles";

export function advancedSettingsPage(navigateBackCallback, props) {
  const lastUpdate = props.settingsStorage.getItem("lastPrayerTimesUpdate");
  const lastUpdateText = getTimeAgo(lastUpdate);

  return Section({ style: LAYOUT_STYLES.mainContainer }, [
    AppBar({
      title: gettext("advanced_settings"),
      onBack: navigateBackCallback,
      showBackButton: true,
    }),

    Spacer({ height: SPACING.sm }),

    buildUpdatePanel(lastUpdateText, props),

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
      return DEFAULT_SETTINGS.fetching.monthsBefore.toString();
    }

    const { monthsMin, monthsMax } = DEFAULT_SETTINGS.fetching;
    return Math.max(monthsMin, Math.min(monthsMax, numValue)).toString();
  }

  function validateFetchIntervalInput(value) {
    const numValue = parseInt(value);

    if (isNaN(numValue)) {
      return DEFAULT_SETTINGS.fetching.automaticFetchInterval.toString();
    }

    const { monthsMax } = DEFAULT_SETTINGS.fetching;
    const maxDays = monthsMax * 30 - 1;
    return Math.max(1, Math.min(maxDays, numValue)).toString();
  }

  // --- Build Methods ---
  function buildUpdatePanel(lastUpdateText, props) {
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
            fetchAndSavePrayerTimes({ storage: props.settingsStorage });
          },
        }),
      ],
    });
  }

  function buildFetchWindowPanel(props) {
    const monthsBefore = props.settingsStorage.getItem("fetchingMonthsBefore");
    const monthsAfter = props.settingsStorage.getItem("fetchingMonthsAfter");

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
            props.settingsStorage.setItem(
              "fetchingMonthsBefore",
              validatedValue
            );
          },
        }),

        Input({
          label: gettext("months_after"),
          value: monthsAfter,
          onChange: (value) => {
            const validatedValue = validateMonthsInput(value);
            props.settingsStorage.setItem(
              "fetchingMonthsAfter",
              validatedValue
            );
          },
        }),
      ],
    });
  }

  function buildAutoFetchPanel(props) {
    const autoFetchDays = props.settingsStorage.getItem("autoFetchDays");

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
          value: autoFetchDays,
          onChange: (value) => {
            const validatedValue = validateFetchIntervalInput(value);
            props.settingsStorage.setItem("autoFetchDays", validatedValue);
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
            props.settingsStorage.setItem("triggerSync", true);
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
            SettingInitializer.resetSessionFlag();
            props.settingsStorage.clear();
            console.log("Settings reset to default.");
          },
        }),
      ],
    });
  }
}
