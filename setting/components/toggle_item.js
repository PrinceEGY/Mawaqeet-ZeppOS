import { Theme } from "../utils/theme";
import { SPACING } from "../utils/styles";

export function ToggleItem({ label, value, onChange }) {
  return View(
    {
      style: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        padding: `${SPACING.md} ${SPACING.sm}`,
        borderBottom: `1px solid ${Theme.dividerColor}`,
      },
    },
    [
      Text(
        {
          style: {
            color: Theme.textPrimaryColor,
            fontSize: "16px",
          },
        },
        label
      ),
      Button({
        style: {
          width: "48px",
          minWidth: "0px",
          height: "24px",
          borderRadius: "16px",
          backgroundColor: value
            ? Theme.accentPrimaryColor
            : Theme.dividerColor,
          display: "flex",
          alignItems: "center",
          justifyContent: value ? "flex-end" : "flex-start",
          padding: "2px",
          border: "none",
          boxShadow: "none",
          transition: "all 0.3s ease",
        },
        onClick: () => onChange(!value),
        label: View({
          style: {
            width: "16px",
            height: "16px",
            margin: "0 1px",
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          },
        }),
      }),
    ]
  );
}
