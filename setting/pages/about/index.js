import { gettext } from "i18n";
import { APP_CONFIG } from "../../../app-config";
import { AppBar } from "../../components/app_bar";
import { Panel } from "../../components/panel";
import { Spacer } from "../../components/spacer";
import { LAYOUT_STYLES, SPACING, TEXT_STYLES } from "../../utils/styles";
import { Theme } from "../../utils/theme";

export function aboutPage(navigateBackCallback, props) {
  const appInfo = APP_CONFIG.app;

  return Section({ style: LAYOUT_STYLES.mainContainer }, [
    AppBar({
      title: gettext("about"),
      onBack: navigateBackCallback,
      showBackButton: true,
    }),

    Spacer({ height: SPACING.sm }),

    Panel({
      children: [
        Text(
          {
            style: {
              ...TEXT_STYLES.heading,
              marginBottom: SPACING.md,
            },
          },
          appInfo.appName
        ),
        Spacer({ height: SPACING.md }),
        buildInfoRow(gettext("version"), appInfo.version.name),
        buildInfoRow(gettext("developer"), appInfo.vender),
        buildInfoRow(gettext("description"), appInfo.description),
        buildInfoRow(gettext("homepage"), appInfo.homepage, true),
        buildInfoRow(gettext("email"), appInfo.email, true),
      ],
    }),
  ]);

  // --- Build Methods ---

  function buildInfoRow(label, value, isLink = false) {
    if (!value) return null;

    let valueComponent;
    if (isLink) {
      valueComponent = Link({}, value);
    } else {
      valueComponent = Text(
        {
          style: {
            ...TEXT_STYLES.normal,
            color: Theme.textPrimaryColor,
            flex: 1,
            textAlign: "center",
          },
        },
        value
      );
    }

    return Section({}, [
      View(
        {
          style: {
            marginBottom: SPACING.sm,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
          },
        },
        [
          Text(
            {
              style: {
                ...TEXT_STYLES.small,
                color: Theme.textSecondaryColor,
                width: "80px",
                marginRight: SPACING.sm,
                textAlign: "left",
              },
            },
            `${label}:`
          ),
          valueComponent,
        ]
      ),
      Spacer({ height: SPACING.md }),
    ]);
  }
}
