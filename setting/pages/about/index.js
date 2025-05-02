import { gettext } from "i18n";
import { AppBar } from "../../components/app_bar";
import { LAYOUT_STYLES, SPACING, TEXT_STYLES } from "../../utils/styles";
import { Panel } from "../../components/panel";
import { Spacer } from "../../components/spacer";
import { Theme } from "../../utils/theme";

export function aboutPage(navigateBackCallback, props) {
  const appInfoString = props.settingsStorage.getItem("appInfo");
  const appInfo = appInfoString ? JSON.parse(appInfoString) : {};

  const createInfoRow = (label, value, isLink = false) => {
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

    return View(
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
    );
  };

  return Section({ style: LAYOUT_STYLES.mainContainer }, [
    AppBar({
      title: gettext("about"),
      onBack: navigateBackCallback,
      showBackButton: true,
    }),

    Spacer({ height: SPACING.md }),

    Panel({
      children: [
        Text(
          {
            style: {
              ...TEXT_STYLES.heading,
              marginBottom: SPACING.md,
              textAlign: "center",
            },
          },
          appInfo.appName || "Mawaqeet"
        ),
        createInfoRow(gettext("version"), appInfo.version),
        createInfoRow(gettext("developer"), appInfo.vender),
        createInfoRow(gettext("description"), appInfo.description), // Added Description row back
        createInfoRow(gettext("homepage"), appInfo.homepage, true),
      ],
    }),
  ]);
}
