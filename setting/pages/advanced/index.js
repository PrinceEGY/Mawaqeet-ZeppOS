import { gettext } from "i18n";
import { Theme } from "../../utils/theme";
import { AppBar } from "../../components/app_bar";
import { TEXT_STYLES, LAYOUT_STYLES, SPACING } from "../../utils/styles";

export function advancedSettingsPage(navigateBackCallback) {
  return Section({ style: LAYOUT_STYLES.mainContainer }, [
    AppBar({
      title: gettext("advanced_settings"),
      onBack: navigateBackCallback,
      showBackButton: true,
    }),

    // Advanced settings content
    Text(
      {
        style: {
          ...TEXT_STYLES.normal,
          padding: SPACING.lg,
        },
      },
      gettext("advanced_settings_coming_soon")
    ),
  ]);
}
