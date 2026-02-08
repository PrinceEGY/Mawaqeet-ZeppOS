import { gettext } from "i18n";
import { TIMINGS_LIST } from "../../../shared/constants";
import { AppBar } from "../../components/app_bar";
import { Panel } from "../../components/panel";
import { Spacer } from "../../components/spacer";
import { ToggleItem } from "../../components/toggle_item";
import { NOTIFY_ICON, NOTIFY_MUTE_ICON, SOUND_ICON, SOUND_MUTE_ICON } from "../../utils/icons";
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
        ...TIMINGS_LIST.map((prayerTiming) => buildPrayerRow(prayerTiming)),
      ],
    }),
  ]);

  // --- Helper Methods ---
  function getNotifyValue(prayerId) {
    const notifyKey = `notify:${prayerId}`;
    return props.storageService.getItem(notifyKey);
  }

  function getDisplayValue(prayerId) {
    const displayKey = `display:${prayerId}`;
    return props.storageService.getItem(displayKey);
  }

  function getSoundValue(prayerId) {
    const soundKey = `sound:${prayerId}`;
    return props.storageService.getItem(soundKey);
  }

  // --- Build Methods ---
  function buildPrayerRow(prayerTiming) {
    const notifyKey = `notify:${prayerTiming.id}`;
    const displayKey = `display:${prayerTiming.id}`;
    const soundKey = `sound:${prayerTiming.id}`;

    const notifyValue = getNotifyValue(prayerTiming.id);
    const displayValue = getDisplayValue(prayerTiming.id);
    const soundValue = getSoundValue(prayerTiming.id);

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
              backgroundImage: soundValue ? SOUND_ICON : SOUND_MUTE_ICON,
              backgroundRepeat: "no-repeat",
            },
          }),
          onClick: () => {
            if (displayValue) {
              props.storageService.setItem(soundKey, !soundValue);
            }
          },
        }),

        View({ style: { flex: 1 } }, [
          ToggleItem({
            label: prayerTiming.label,
            value: displayValue,
            onChange: (newDisplayValue) => {
              props.storageService.setItem(displayKey, newDisplayValue);
              if (!newDisplayValue) {
                if (notifyValue) props.storageService.setItem(notifyKey, false);
                if (soundValue) props.storageService.setItem(soundKey, false);
              } else {
                props.storageService.setItem(notifyKey, true);
                props.storageService.setItem(soundKey, true);
              }
            },
          }),
        ]),
      ]
    );
  }
}
