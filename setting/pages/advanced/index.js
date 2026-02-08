import { gettext } from "i18n";
import { SettingInitializer } from "../../../shared/utils/setting-init.js";
import { AppBar } from "../../components/app_bar";
import { Panel } from "../../components/panel";
import { Spacer } from "../../components/spacer";
import {
  BUTTON_STYLES,
  LAYOUT_STYLES,
  SPACING,
  TEXT_STYLES,
} from "../../utils/styles";

export function advancedSettingsPage(navigateBackCallback, props) {
  return Section({ style: LAYOUT_STYLES.mainContainer }, [
    AppBar({
      title: gettext("advanced_settings"),
      onBack: navigateBackCallback,
      showBackButton: true,
    }),

    Spacer({ height: SPACING.sm }),

    buildManualSyncPanel(props),

    Spacer({ height: SPACING.xs }),

    buildResetSettingsPanel(props),

    Spacer({ height: SPACING.md }),
  ]);

  function buildManualSyncPanel(props) {
    return Panel({
      children: [
        Text(
          {
            style: {
              ...TEXT_STYLES.subheading,
              marginBottom: SPACING.xs,
            },
          },
          gettext("manual_sync")
        ),
        Text(
          {
            style: {
              ...TEXT_STYLES.small,
              marginBottom: SPACING.md,
            },
          },
          gettext("manual_sync_desc")
        ),
        Button({
          label: gettext("manual_sync_btn"),
          style: { ...BUTTON_STYLES.primary },
          onClick: () => {
            props.storageService.setItem("triggerFullSync", true);
          },
        }),
      ],
    });
  }

  function buildResetSettingsPanel(props) {
    return Panel({
      children: [
        Text(
          {
            style: {
              ...TEXT_STYLES.subheading,
              marginBottom: SPACING.xs,
            },
          },
          gettext("reset_default_settings")
        ),
        Text(
          {
            style: {
              ...TEXT_STYLES.small,
              marginBottom: SPACING.md,
            },
          },
          gettext("reset_settings_desc")
        ),
        Button({
          label: gettext("reset_settings_btn"),
          style: { ...BUTTON_STYLES.primary, backgroundColor: "#d32f2f" },
          onClick: () => {
            props.storageService.setItem("triggerAppReset", true);
            console.log("Settings reset triggered. Device reset signal sent.");
            props.storageService.clear();

            SettingInitializer.resetSessionFlag();
            SettingInitializer.initNavState(props.storageService);
          },
        }),
      ],
    });
  }
}
