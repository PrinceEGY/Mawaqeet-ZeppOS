import { CalculationMethod } from "adhan";
import { gettext } from "i18n";
import { CALCULATION_METHODS } from "../../../shared/constants";
import { AppBar } from "../../components/app_bar";
import { Panel } from "../../components/panel";
import { Spacer } from "../../components/spacer";
import { LAYOUT_STYLES, SPACING, TEXT_STYLES } from "../../utils/styles";
import { Theme } from "../../utils/theme";

const TEMP_VISIBILITY_STATE_KEY = "temp_calcMethodVisibility";

export function calculationSettingsPage(navigateBackCallback, props) {
  const currentMethod = props.storageService.getItem("calculationMethod");
  const selectedMethodId = currentMethod?.id || null;

  let visibilityState = props.storageService.getItem(TEMP_VISIBILITY_STATE_KEY) || {};

  function isDetailsVisible(methodId) {
    if (visibilityState[methodId] !== undefined) {
      return visibilityState[methodId];
    }
    // Default: show for selected method
    return methodId === selectedMethodId;
  }

  function toggleDetails(methodId) {
    visibilityState[methodId] = !isDetailsVisible(methodId);
    props.storageService.setItem(TEMP_VISIBILITY_STATE_KEY, visibilityState);
  }

  function getMethodDetails(methodId) {
    const factory = CalculationMethod[methodId];
    if (!factory) return null;

    const params = factory();
    const details = [];

    if (params.fajrAngle) {
      details.push(`Fajr: ${params.fajrAngle}°`);
    }

    if (params.ishaAngle) {
      details.push(`Isha: ${params.ishaAngle}°`);
    } else if (params.ishaInterval) {
      details.push(`Isha: ${params.ishaInterval} Minutes after Maghrib`);
    }

    return details.join(", ");
  }

  return Section({ style: LAYOUT_STYLES.mainContainer }, [
    AppBar({
      title: gettext("calculation_method"),
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
              marginBottom: SPACING.md,
            },
          },
          gettext("calc_method_page_desc")
        ),
        ...CALCULATION_METHODS.map((method) =>
          buildCalcMethodRow({
            method: method,
            isSelected: method.id === selectedMethodId,
            showDetails: isDetailsVisible(method.id),
            detailsText: getMethodDetails(method.id),
            onSelect: () => {
              if (selectedMethodId && selectedMethodId !== method.id) {
                visibilityState[selectedMethodId] = false;
              }

              if (visibilityState[method.id] === false) {
                delete visibilityState[method.id];
              }

              props.storageService.setItem(TEMP_VISIBILITY_STATE_KEY, visibilityState);
              props.storageService.setItem("calculationMethod", method);
            },
            onToggleDetails: () => {
              toggleDetails(method.id);
            },
          })
        ),
      ],
    }),
  ]);

  function buildCalcMethodRow({ method, isSelected, showDetails, detailsText, onSelect, onToggleDetails }) {
    return View({}, [
      View(
        {
          style: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: SPACING.xs,
          },
        },
        [
          Button({
            style: {
              flex: 1,
              backgroundColor: isSelected
                ? Theme.accentPrimaryColor
                : Theme.bgSecondaryColor,
              borderRadius: "8px",
              boxShadow: "none",
              padding: `${SPACING.sm} ${SPACING.lg}`,
              fontWeight: "normal",
              fontSize: "16px",
              width: "100%",
            },
            label: View(
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: "100%",
                },
              },
              [
                // Title
                Text(
                  {
                    style: {
                      color: isSelected
                        ? Theme.textPrimaryColor
                        : Theme.textPrimaryColor,
                      fontSize: "16px",
                      textAlign: "left",
                    },
                  },
                  method.label
                ),
                // Description
                showDetails &&
                detailsText &&
                Text(
                  {
                    style: {
                      fontSize: "14px",
                      ...TEXT_STYLES.small,
                      padding: `0px`,
                      textAlign: "left",
                      color: isSelected
                        ? Theme.textPrimaryColor
                        : Theme.textSecondaryColor,
                      lineHeight: "1.2",
                    },
                  },
                  detailsText
                ),
              ]
            ),
            onClick: onSelect,
          }),

          Button({
            style: {
              backgroundColor: showDetails
                ? Theme.accentPrimaryColor
                : Theme.bgSecondaryColor,
              color: showDetails ? Theme.textPrimaryColor : Theme.textSecondaryColor,
              borderRadius: "50%",
              boxShadow: "none",
              padding: SPACING.xs,
              minWidth: "32px",
              width: "32px",
              height: "32px",
              fontSize: "14px",
            },
            label: "ⓘ",
            onClick: onToggleDetails,
          }),
        ]
      ),
      View({
        style: {
          ...LAYOUT_STYLES.separator,
          margin: `${SPACING.xs} 0`,
        },
      }),
    ]);
  }
}
