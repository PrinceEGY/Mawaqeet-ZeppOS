import { gettext } from "i18n";

// Export the notification settings UI component
export function notificationSettingsPage(navigateBackCallback) {
  return Section(
    {
      marginTop: "4px",
      padding: "4px",
    },
    [
      // Header with back button
      View({ padding: "12px 0", flexDirection: "row", alignItems: "center" }, [
        Button({
          style: { marginRight: "8px" },
          label: "←",
          onClick: () => {
            navigateBackCallback();
          },
        }),
        Text(
          { fontSize: "20px", fontWeight: "bold" },
          gettext("notification_settings")
        ),
      ]),

      // Notification settings content
      Text(
        { padding: "16px", textAlign: "center" },
        gettext("notification_settings_coming_soon")
      ),
    ]
  );
}
