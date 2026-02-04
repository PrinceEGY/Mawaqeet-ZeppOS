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
    const notifyKey = `notify:${prayerName}`;
    return props.storageService.getItem(notifyKey);
  }

  function getDisplayValue(prayerName) {
    const displayKey = `display:${prayerName}`;
    return props.storageService.getItem(displayKey);
  }

  // --- Build Methods ---
  function buildPrayerRow(prayer) {
    const notifyKey = `notify:${prayer.id}`;
    const displayKey = `display:${prayer.id}`;

    const notifyValue = getNotifyValue(prayer.id);
    const displayValue = getDisplayValue(prayer.id);

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
              props.storageService.setItem(notifyKey, !notifyValue);
            }
          },
        }),

        View({ style: { flex: 1 } }, [
          ToggleItem({
            label: prayer.label,
            value: displayValue,
            onChange: (newDisplayValue) => {
              props.storageService.setItem(displayKey, newDisplayValue);
              if (!newDisplayValue && notifyValue) {
                props.storageService.setItem(notifyKey, false);
              } else if (newDisplayValue) {
                props.storageService.setItem(notifyKey, true);
              }
            },
          }),
        ]),
      ]
    );
  }
}
