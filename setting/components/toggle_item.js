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
      Toggle({
        value: value,
        onChange: onChange,
      }),
    ]
  );
}
