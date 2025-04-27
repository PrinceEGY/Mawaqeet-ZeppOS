import { gettext } from "i18n";
import { AppBar } from "../../components/app_bar";
import { Panel } from "../../components/panel";
import { Spacer } from "../../components/spacer";
import { ToggleItem } from "../../components/toggle_item";
import { LAYOUT_STYLES, SPACING, TEXT_STYLES } from "../../utils/styles";
import { Theme } from "../../utils/theme";
import { TIMINGS_LIST } from "../../../shared/constants";

export function notificationSettingsPage(navigateBackCallback, props) {
  return Section({ style: LAYOUT_STYLES.mainContainer }, [
    AppBar({
      title: gettext("notification_settings"),
      onBack: navigateBackCallback,
      showBackButton: true,
    }),

    Spacer({ height: SPACING.md }),

    Text(
      {
        style: {
          ...TEXT_STYLES.small,
          padding: `0 ${SPACING.lg}`,
          marginBottom: SPACING.md,
        },
      },
      gettext("notification_description")
    ),

    Panel({
      children: TIMINGS_LIST.map((prayer) => {
        const settingsKey = `notify_${prayer.name}`;
        const savedValue =
          props && props.settingsStorage
            ? props.settingsStorage.getItem(settingsKey) === "true"
            : false;

        return ToggleItem({
          label: prayer.label,
          settingsKey: settingsKey,
          value: savedValue,
        });
      }),
    }),
  ]);
}
