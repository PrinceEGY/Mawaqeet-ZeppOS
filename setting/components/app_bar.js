import { Theme } from "../utils/theme";
import { BACK_BTN_ICON } from "../utils/icons";
import { SPACING } from "../utils/styles";

export function AppBar({ title, onBack, showBackButton = true }) {
  return View(
    {
      style: {
        padding: SPACING.lg,
        backgroundColor: Theme.bgSecondaryColor,
        width: "100%",
        margin: 0,
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      },
    },
    [
      // Only render back button if showBackButton is true
      showBackButton &&
        Button({
          style: {
            marginRight: SPACING.sm,
            backgroundColor: Theme.bgSecondaryColor,
            color: Theme.textPrimaryColor,
            padding: `${SPACING.xs} ${SPACING.sm}`,
            minWidth: "32px",
            boxShadow: "none",
          },
          label: View({
            style: {
              width: "24px",
              height: "24px",
              backgroundImage: BACK_BTN_ICON,
              backgroundRepeat: "no-repeat",
            },
          }),
          onClick: onBack,
        }),

      Text(
        {
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: Theme.textPrimaryColor,
          },
        },
        title
      ),
    ]
  );
}
