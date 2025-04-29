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
import {
  TWO_YEARS_BEFORE,
  TWO_YEARS_AFTER,
} from "../../../shared/constants.js";
import { NOTIFY_ICON } from "../../utils/icons.js";

function handleManualUpdate(props) {
  const currentLocation = JSON.parse(
    props.settingsStorage.getItem("currentLocation")
  );

  const calculationMethod = JSON.parse(
    props.settingsStorage.getItem("calculationMethod")
  );

  fetchExtendedPrayerTimes({
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    startDate: TWO_YEARS_BEFORE,
    endDate: TWO_YEARS_AFTER,
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
      label: gettext("update_now"),
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

    Panel({
      children: createUpdatePanel(lastUpdateText, props),
    }),

    Spacer({ height: SPACING.sm }),

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
