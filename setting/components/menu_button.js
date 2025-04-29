import { ARROW_ICON } from "../utils/icons";
import { Theme } from "../utils/theme";
import { SPACING } from "../utils/styles";

export function MenuButton(options) {
  const { label, onClick, showArrow = true } = options;

  return Button({
    style: {
      backgroundColor: Theme.bgSecondaryColor,
      color: Theme.textPrimaryColor,
      width: "100%",
      borderBottom: `1px solid ${Theme.dividerColor}`,
      borderRadius: 0,
      boxShadow: "none",
      padding: `${SPACING.md} ${SPACING.sm}`,
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
        Text({}, label),
        showArrow &&
          View({
            style: {
              width: "32px",
              height: "32px",
              backgroundImage: ARROW_ICON,
              backgroundRepeat: "no-repeat",
            },
          }),
      ]
    ),
    onClick,
  });
}
