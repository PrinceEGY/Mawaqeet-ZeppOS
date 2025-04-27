import { gettext } from "i18n";
import { AppBar } from "../../components/app_bar";
import { LAYOUT_STYLES, SPACING, TEXT_STYLES } from "../../utils/styles";

export function aboutPage(navigateBackCallback) {
  return Section({ style: LAYOUT_STYLES.mainContainer }, [
    AppBar({
      title: gettext("about"),
      onBack: navigateBackCallback,
      showBackButton: true,
    }),

    // About page content
    Text(
      {
        style: {
          ...TEXT_STYLES.normal,
          padding: SPACING.lg,
        },
      },
      gettext("about_page_coming_soon")
    ),
  ]);
}
