import { gettext } from "i18n";
import { Theme } from "../../utils/theme";
import { AppBar } from "../../components/app_bar";
import { TEXT_STYLES, LAYOUT_STYLES, SPACING } from "../../utils/styles";

export function calculationSettingsPage(navigateBackCallback) {
  return Section({ style: LAYOUT_STYLES.mainContainer }, [
    AppBar({
      title: gettext("calculation_method"),
      onBack: navigateBackCallback,
      showBackButton: true,
    }),

    // Calculation settings content
    Text(
      {
        style: {
          ...TEXT_STYLES.normal,
          padding: SPACING.lg,
        },
      },
      gettext("calculation_method_coming_soon")
    ),
  ]);
}
