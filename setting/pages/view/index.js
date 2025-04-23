import { gettext } from "i18n";
import { Theme } from "../../utils/theme";
import { AppBar } from "../../components/app_bar";
import { TEXT_STYLES, LAYOUT_STYLES, SPACING } from "../../utils/styles";

// Export the view settings UI component
export function viewSettingsPage(navigateBackCallback) {
  return Section({ style: LAYOUT_STYLES.mainContainer }, [
    // AppBar with back button
    AppBar({
      title: gettext("view_options"),
      onBack: navigateBackCallback,
      showBackButton: true,
    }),

    // View settings content
    Text(
      {
        style: {
          ...TEXT_STYLES.normal,
          padding: SPACING.lg,
        },
      },
      gettext("view_options_coming_soon")
    ),
  ]);
}
