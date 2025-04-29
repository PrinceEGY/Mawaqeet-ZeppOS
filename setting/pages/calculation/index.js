import { gettext } from "i18n";
import { Theme } from "../../utils/theme";
import { AppBar } from "../../components/app_bar";
import { TEXT_STYLES, LAYOUT_STYLES, SPACING } from "../../utils/styles";
import { Panel } from "../../components/panel";

function formatParameters(params) {
  if (!params) return "";

  const parts = [];

  if (params.Fajr !== undefined) {
    const value =
      typeof params.Fajr === "number" ? `${params.Fajr}°` : params.Fajr;
    parts.push(`Fajr: ${value}`);
  }

  if (params.Maghrib !== undefined) {
    if (typeof params.Maghrib === "number") {
      parts.push(`Maghrib: ${params.Maghrib}°`);
    } else if (
      typeof params.Maghrib === "string" &&
      params.Maghrib.includes("min")
    ) {
      parts.push(
        `Maghrib: ${params.Maghrib.replace("min", "Minutes after Sunset")}`
      );
    }
  }

  if (params.Isha !== undefined) {
    if (typeof params.Isha === "number") {
      parts.push(`Isha: ${params.Isha}°`);
    } else if (typeof params.Isha === "string" && params.Isha.includes("min")) {
      parts.push(
        `Isha: ${params.Isha.replace("min", "Minutes after Maghrib")}`
      );
    }
  }

  return parts.join(", ");
}

function CalculationMethodRow({ method, isSelected, onClick }) {
  let descriptionText = "";
  if (method.label === "Auto" || method.id === -1) {
    descriptionText = gettext("calculation_method_auto_desc");
  } else if (method.params) {
    descriptionText = formatParameters(method.params);
  }

  return View({}, [
    Button({
      style: {
        backgroundColor: isSelected
          ? Theme.accentPrimaryColor
          : Theme.bgSecondaryColor,
        color: isSelected ? Theme.accentTextColor : Theme.textPrimaryColor,
        width: "100%",
        borderRadius: "8px",
        boxShadow: "none",
        padding: `${SPACING.sm} ${SPACING.lg}`,
        fontWeight: "normal",
        fontSize: "16px",
      },
      label: View(
        {
          style: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          },
        },
        [
          View(
            {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              },
            },
            [
              Text({ style: { color: Theme.textPrimaryColor } }, method.name),
              descriptionText &&
                Text(
                  {
                    style: {
                      ...TEXT_STYLES.small,
                      padding: `0px`,
                      textAlign: "left",
                      color: isSelected
                        ? Theme.textPrimaryColor
                        : Theme.textSecondaryColor,
                    },
                  },
                  descriptionText
                ),
            ]
          ),
        ]
      ),
      onClick,
    }),
    View({
      style: {
        ...LAYOUT_STYLES.separator,
        margin: `${SPACING.xs} 0`,
      },
    }),
  ]);
}

export function calculationSettingsPage(navigateBackCallback, props) {
  const methodsList = props.settingsStorage.getItem("calculationMethodsList");
  const methods = methodsList ? JSON.parse(methodsList) : [];

  const currentMethod = props.settingsStorage.getItem("calculationMethod");
  const selectedMethodId = currentMethod ? JSON.parse(currentMethod).id : null;

  return Section({ style: LAYOUT_STYLES.mainContainer }, [
    AppBar({
      title: gettext("calculation_method"),
      onBack: navigateBackCallback,
      showBackButton: true,
    }),

    Panel({
      children: methods.map((method) =>
        CalculationMethodRow({
          method: method,
          isSelected: method.id === selectedMethodId,
          onClick: () => {
            props.settingsStorage.setItem(
              "calculationMethod",
              JSON.stringify(method)
            );
          },
        })
      ),
    }),
  ]);
}
