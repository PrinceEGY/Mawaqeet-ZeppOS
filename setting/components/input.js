import { SPACING } from "../utils/styles";
import { Theme } from "../utils/theme";

export function Input({ label, value, onChange }) {
  return TextInput({
    label: label,
    value: value,
    labelStyle: {
      color: Theme.textPrimaryColor,
      marginBottom: `${SPACING.xs}`,
    },
    subStyle: {
      borderRadius: "4px",
      backgroundColor: "white",
      color: "black",
      padding: `${SPACING.sm} ${SPACING.md}`,
      marginBottom: SPACING.md,
    },
    onChange: onChange,
  });
}
