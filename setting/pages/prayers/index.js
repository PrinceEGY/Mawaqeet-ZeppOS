import { gettext } from "i18n";
import { TIMINGS_LIST } from "../../../shared/constants";
import { AppBar } from "../../components/app_bar";
import { Panel } from "../../components/panel";
import { Spacer } from "../../components/spacer";
import { ToggleItem } from "../../components/toggle_item";
import { NOTIFY_ICON, NOTIFY_MUTE_ICON } from "../../utils/icons";
import { LAYOUT_STYLES, SPACING, TEXT_STYLES } from "../../utils/styles";
import { Theme } from "../../utils/theme";

export function prayersSettingsPage(navigateBackCallback, props) {
  return Section({ style: LAYOUT_STYLES.mainContainer }, [
    AppBar({
      title: gettext("prayers_settings"),
      onBack: navigateBackCallback,
      showBackButton: true,
    }),

    Spacer({ height: SPACING.sm }),

    Panel({
      children: [
        Text(
          {
            style: {
              ...TEXT_STYLES.small,
              padding: `0 ${SPACING.lg}`,
              marginBottom: SPACING.md,
            },
          },
          gettext("prayers_settings_description")
        ),
        ...TIMINGS_LIST.map((prayer) => buildPrayerRow(prayer)),
      ],
    }),
  ]);

  // --- Helper Methods ---
  function getNotifyValue(prayerName) {
    const notifyKey = `notify_${prayerName}`;
    return props && props.settingsStorage
      ? props.settingsStorage.getItem(notifyKey) === "true"
      : false;
  }

  function getDisplayValue(prayerName) {
    const displayKey = `display_${prayerName}`;
    return props && props.settingsStorage
      ? props.settingsStorage.getItem(displayKey) === "true"
      : true;
  }

  // --- Build Methods ---
  function buildPrayerRow(prayer) {
    const notifyKey = `notify_${prayer.name}`;
    const displayKey = `display_${prayer.name}`;

    const notifyValue = getNotifyValue(prayer.name);
    const displayValue = getDisplayValue(prayer.name);

    return View(
      {
        style: {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
        },
      },
      [
        Button({
          style: {
            marginRight: SPACING.sm,
            backgroundColor: Theme.bgSecondaryColor,
            color: Theme.textPrimaryColor,
            padding: `${SPACING.xs} ${SPACING.sm}`,
            minWidth: "32px",
            boxShadow: "none",
            cursor: displayValue ? "pointer" : "not-allowed",
          },
          label: View({
            style: {
              width: "24px",
              height: "24px",
              backgroundImage: notifyValue ? NOTIFY_ICON : NOTIFY_MUTE_ICON,
              backgroundRepeat: "no-repeat",
            },
          }),
          onClick: () => {
            if (displayValue) {
              const newValue = notifyValue ? "false" : "true";
              props.settingsStorage.setItem(notifyKey, newValue);
            }
          },
        }),

        View({ style: { flex: 1 } }, [
          ToggleItem({
            label: prayer.label,
            settingsKey: displayKey,
            value: displayValue,
            onChange: (newDisplayValue) => {
              if (!newDisplayValue && notifyValue) {
                props.settingsStorage.setItem(notifyKey, "false");
              } else if (newDisplayValue) {
                props.settingsStorage.setItem(notifyKey, "true");
              }
            },
          }),
        ]),
      ]
    );
  }
}
