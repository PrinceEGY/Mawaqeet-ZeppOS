import { ARROW_ICON } from "../utils/icons";
import { Theme } from "../utils/theme";

export function MenuButton(options) {
  const { label, onClick } = options;

  return Button({
    style: {
      backgroundColor: Theme.bgSecondaryColor,
      color: Theme.textPrimaryColor,
      width: "100%",
      borderBottom: `1px solid ${Theme.dividerColor}`,
      borderRadius: 0,
      padding: "12px 8px",
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
