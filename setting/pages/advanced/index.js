import { gettext } from "i18n";
import { Theme } from "../../utils/theme";
import { AppBar } from "../../components/app_bar";
import { Panel } from "../../components/panel";
import { Spacer } from "../../components/spacer";
import {
  TEXT_STYLES,
  LAYOUT_STYLES,
  SPACING,
  BUTTON_STYLES,
} from "../../utils/styles";
import {
  fetchExtendedPrayerTimes,
  getTimeAgo,
} from "../../../shared/helpers.js";
import { DEFAULT_SETTINGS } from "../../../shared/constants.js";

function handleManualUpdate(props) {
  const currentLocation = JSON.parse(
    props.settingsStorage.getItem("currentLocation")
  );

  const calculationMethod = JSON.parse(
    props.settingsStorage.getItem("calculationMethod")
  );

  const monthsBefore = props.settingsStorage.getItem("fetchingMonthsBefore");
  const monthsAfter = props.settingsStorage.getItem("fetchingMonthsAfter");

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - parseInt(monthsBefore));

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + parseInt(monthsAfter));

  fetchExtendedPrayerTimes({
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    startDate: startDate,
    endDate: endDate,
    method: calculationMethod,
  })
    .then((result) => {
      const currentTime = new Date().getTime();
      props.settingsStorage.setItem(
        "lastPrayerTimesUpdate",
        currentTime.toString()
      );
      props.settingsStorage.setItem("prayerTimes", JSON.stringify(result));
    })
    .catch((error) => {
      console.error("Error fetching prayer times:", error);
    });
}

function createUpdatePanel(lastUpdateText, props) {
  return [
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
      gettext("prayer_update_clarification")
    ),
    Button({
      label: gettext("manual_update"),
      style: {
        ...BUTTON_STYLES.primary,
        width: "80%",
      },
      onClick: () => {
        handleManualUpdate(props);
      },
    }),
  ];
}

function InputRow({ label, value, onChange }) {
  return TextInput({
    label: label,
    value: value,
    labelStyle: {
      color: Theme.textPrimaryColor,
      marginBottom: `${SPACING.xs}`,
    },
    subStyle: {
      borderRadius: "4px",
      backgroundColor: "white",
      color: "black",
      padding: `${SPACING.sm} ${SPACING.md}`,
      marginBottom: SPACING.md,
    },
    onChange: onChange,
  });
}

function validateMonthsInput(value) {
  const numValue = parseInt(value);

  if (isNaN(numValue)) {
    return DEFAULT_SETTINGS.fetching.monthsBefore.toString();
  }

  const { monthsMin, monthsMax } = DEFAULT_SETTINGS.fetching;
  return Math.max(monthsMin, Math.min(monthsMax, numValue)).toString();
}

function createFetchWindowPanel(props) {
  const monthsBefore = props.settingsStorage.getItem("fetchingMonthsBefore");
  const monthsAfter = props.settingsStorage.getItem("fetchingMonthsAfter");

  return [
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
      gettext("fetch_window_description")
    ),

    InputRow({
      label: gettext("months_before"),
      value: monthsBefore,
      onChange: (value) => {
        const validatedValue = validateMonthsInput(value);
        props.settingsStorage.setItem("fetchingMonthsBefore", validatedValue);
      },
    }),

    InputRow({
      label: gettext("months_after"),
      value: monthsAfter,
      onChange: (value) => {
        const validatedValue = validateMonthsInput(value);
        props.settingsStorage.setItem("fetchingMonthsAfter", validatedValue);
      },
    }),
  ];
}

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

    // Prayer times update panel
    Panel({
      children: createUpdatePanel(lastUpdateText, props),
    }),

    Spacer({ height: SPACING.xs }),

    // Fetch window size panel
    Panel({
      children: createFetchWindowPanel(props),
    }),

    Spacer({ height: SPACING.xs }),

    // Reset settings panel
    Panel({
      children: [
        Text(
          {
            style: {
              ...TEXT_STYLES.subheading,
              marginBottom: SPACING.md,
            },
          },
          gettext("reset_all_settings")
        ),
        Button({
          label: gettext("reset_settings"),
          style: {
            backgroundColor: Theme.bgSecondaryColor,
            color: Theme.textPrimaryColor,
            padding: `${SPACING.sm} ${SPACING.md}`,
            borderRadius: "4px",
          },
          onClick: () => {
            props.settingsStorage.clear();
            console.log("Settings reset to default.");
          },
        }),
      ],
    }),
  ]);
}
