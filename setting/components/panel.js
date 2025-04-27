import { Theme } from "../utils/theme";
import { SPACING } from "../utils/styles";

export function Panel({
  children,
  margin = SPACING.sm,
  padding = SPACING.md,
  style = {},
}) {
  return View(
    {
      style: {
        backgroundColor: Theme.bgSecondaryColor,
        borderRadius: "12px",
        margin: margin,
        padding: padding,
        ...style,
      },
    },
    Array.isArray(children) ? children : [children]
  );
}
