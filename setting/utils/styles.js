import { Theme } from "./theme.js";

export const TEXT_STYLES = {
  heading: {
    fontSize: "16px",
    fontWeight: "bold",
    textAlign: "center",
    color: Theme.textPrimaryColor,
    width: "100%",
    display: "block",
  },
  normal: {
    fontSize: "14px",
    textAlign: "center",
    color: Theme.textPrimaryColor,
    width: "100%",
    display: "block",
  },
  small: {
    fontSize: "12px",
    textAlign: "center",
    color: Theme.textSecondaryColor,
    width: "100%",
    display: "block",
    padding: "0 10px",
  },
  subheading: {
    fontSize: "14px",
    fontWeight: "bold",
    textAlign: "center",
    color: Theme.textPrimaryColor,
    width: "100%",
    display: "block",
  },
};

// Common button styles
export const BUTTON_STYLES = {
  primary: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    padding: "8px 0px",
    backgroundColor: Theme.accentPrimaryColor,
    color: Theme.textPrimaryColor,
    fontSize: "14px",
  },
};

// Common layout styles
export const LAYOUT_STYLES = {
  separator: {
    width: "100%",
    height: "1px",
    backgroundColor: Theme.dividerColor,
  },
  mainContainer: {
    color: Theme.textPrimaryColor,
    backgroundColor: Theme.bgPrimaryColor,
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    overflowY: "auto",
    overflowX: "auto",
  },
};

// Common spacing values for consistent margins and paddings
export const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
};
