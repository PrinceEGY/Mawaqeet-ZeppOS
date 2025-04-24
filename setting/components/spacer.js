import { SPACING } from "../utils/styles";

export function Spacer(options = {}) {
  const { width = "100%", height = SPACING.sm } = options;

  return View({
    style: {
      width: width,
      height: height,
      backgroundColor: "transparent",
    },
  });
}
