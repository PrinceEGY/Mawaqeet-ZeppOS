import { Theme } from "../utils/theme";

export function Panel({
  children,
  margin = "0px",
  padding = "12px",
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
