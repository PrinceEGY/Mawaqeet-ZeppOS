import {
  SCROLL_MODE_FREE,
  SCROLL_MODE_SWIPER_HORIZONTAL,
  setScrollMode,
  swipeToIndex,
} from "@zos/page";
import * as hmUI from "@zos/ui";
import { BasePage } from "../shared/base_page";
import { ButtonWidget } from "../shared/widgets";
import { DeviceLogger } from "../utils/device-logger";
import { DEVICE_HEIGHT, LAYOUT } from "./index.r.layout";
import { OnboardingPageState } from "./onboarding_state";
import {
  InstructionsWidget,
  RequirementsWidget,
  WelcomeWidget,
} from "./widgets";

const logger = new DeviceLogger("onboarding-page");

export class OnboardingPage extends BasePage {
  constructor(globalState) {
    super(globalState);
    this.pageIndicator = null;
    this.navigationTimeout = null;
    this.onSettingsValidation = this.onSettingsValidation.bind(this);
    this.onPageChanged = this.onPageChanged.bind(this);
    this.onSyncStateChanged = this.onSyncStateChanged.bind(this);
  }

  onInit() {
    this.pageState = new OnboardingPageState(this.globalState);
    this.pageState.on("settingsValidation", this.onSettingsValidation);
    this.pageState.on("pageChanged", this.onPageChanged);
    this.pageState.on("syncStateChanged", this.onSyncStateChanged);

    this.globalState.setConnectionRequirement(
      "To complete initial setup.",
      "onboarding"
    );
    logger.debug("Onboarding page initialized");
  }

  onBuild() {
    this.widgets = {
      // Page 0 - Welcome
      welcome: new WelcomeWidget({
        pageState: this.pageState,
        pageIndex: 0,
      }),

      // Page 1 - Instructions
      instructions: new InstructionsWidget({
        pageState: this.pageState,
        pageIndex: 1,
      }),

      // Page 2 - Status
      requirements: new RequirementsWidget({
        pageState: this.pageState,
        pageIndex: 2,
      }),
      syncButton: new ButtonWidget({
        pageState: this.pageState,
        text: "Sync Now",
        layout: LAYOUT.STATUS.SYNC_BUTTON,
        disabledLayout: LAYOUT.STATUS.SYNC_BUTTON_DISABLED,
        pageIndex: 2,
        clickHandler: () => this._handleSync(),
        isEnabled: true,
      }),
      continueButton: new ButtonWidget({
        pageState: this.pageState,
        text: "Continue",
        layout: LAYOUT.STATUS.CONTINUE_BUTTON,
        pageIndex: 2,
        clickHandler: () => this._handleContinue(),
        isEnabled: true,
      }),

      // Navigation Buttons
      leftNavButton: new ButtonWidget({
        pageState: this.pageState,
        layout: LAYOUT.NAVIGATION.LEFT_BUTTON,
        disabledLayout: LAYOUT.NAVIGATION.LEFT_BUTTON_DISABLED,
        clickHandler: () => this._navigateLeft(),
        isEnabled: this.pageState.canNavigateLeft(),
        pageIndex: this.pageState.getCurrentPageIndex(),
      }),
      rightNavButton: new ButtonWidget({
        pageState: this.pageState,
        layout: LAYOUT.NAVIGATION.RIGHT_BUTTON,
        disabledLayout: LAYOUT.NAVIGATION.RIGHT_BUTTON_DISABLED,
        clickHandler: () => this._navigateRight(),
        isEnabled: this.pageState.canNavigateRight(),
        pageIndex: this.pageState.getCurrentPageIndex(),
      }),
    };

    this._updateActionButtons();
    logger.debug("Onboarding page built");
  }

  onShow() {
    this._setupScrollMode();
    this._createPageIndicator();
    this.pageState.validateRequiredSettings();
    logger.debug("Onboarding page shown");
  }

  onHide() {
    swipeToIndex({ index: 0, animation: "SCROLL_ANIMATION_NONE" });
    this._clearScrollMode();
    this._destroyPageIndicator();
    logger.debug("Onboarding page hidden");
  }

  onUpdate() {
    this.pageState.validateRequiredSettings();
  }

  onDestroy() {
    this.pageState.off("settingsValidation", this.onSettingsValidation);
    this.pageState.off("pageChanged", this.onPageChanged);
    this.pageState.off("syncStateChanged", this.onSyncStateChanged);

    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
      this.navigationTimeout = null;
    }

    this._clearScrollMode();
    this._destroyPageIndicator();

    logger.debug("Onboarding page destroyed");
  }

  onSettingsValidation() {
    this._updateActionButtons();
  }

  onPageChanged() {
    this._hideNavigationButtons();
  }

  onSyncStateChanged(isDisabled) {
    if (this.widgets.syncButton) {
      this.widgets.syncButton.update({ isEnabled: !isDisabled });
    }
  }

  _setupScrollMode() {
    setScrollMode({
      mode: SCROLL_MODE_SWIPER_HORIZONTAL,
      options: {
        width: DEVICE_HEIGHT,
        count: this.pageState.getTotalPages(),
        modeParams: {
          on_page: (pageIndex) => {
            this.pageState.setCurrentPageIndex(pageIndex);
            logger.debug(`Switched to page: ${pageIndex}`);
          },
          crown_enable: true,
        },
      },
    });
  }

  _createPageIndicator() {
    if (this.pageIndicator) return;
    this.pageIndicator = hmUI.createWidget(hmUI.widget.PAGE_INDICATOR, {
      ...LAYOUT.PAGE_INDICATOR,
    });
  }

  _destroyPageIndicator() {
    if (this.pageIndicator) {
      hmUI.deleteWidget(this.pageIndicator);
      this.pageIndicator = null;
    }
  }

  _clearScrollMode() {
    setScrollMode({
      mode: SCROLL_MODE_SWIPER_HORIZONTAL,
      options: {
        modeParams: {
          on_page: null,
        },
      },
    });
    setScrollMode({ mode: SCROLL_MODE_FREE });
  }

  _handleContinue() {
    this.globalState.clearConnectionRequirement();
    this.globalState.completeOnboarding();
    swipeToIndex({ index: 0, animation: "SCROLL_ANIMATION_NONE" });
    this._clearScrollMode();
    this.destroy();
    delete this.globalState.pages["onboarding"];
    this.globalState.navigate("home");
    logger.debug("Onboarding completed, navigating to home");
  }

  _handleSync() {
    this.pageState.triggerSync();
    logger.debug("Sync triggered from onboarding");
  }

  _navigateLeft() {
    const currentPage = this.pageState.getCurrentPageIndex();
    if (currentPage > 0) {
      this._hideNavigationButtons();
      swipeToIndex({ index: currentPage - 1 });
    }
  }

  _navigateRight() {
    const currentPage = this.pageState.getCurrentPageIndex();
    const totalPages = this.pageState.getTotalPages();
    if (currentPage < totalPages - 1) {
      this._hideNavigationButtons();
      swipeToIndex({ index: currentPage + 1 });
    }
  }

  _hideNavigationButtons() {
    this.widgets.leftNavButton?.hide();
    this.widgets.rightNavButton?.hide();

    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
    }

    this.navigationTimeout = setTimeout(() => {
      if (this.isVisible) {
        this._updateNavigationButtons();
        this.widgets.leftNavButton?.show();
        this.widgets.rightNavButton?.show();
        this.navigationTimeout = null;
      }
    }, 300);
  }

  _updateActionButtons() {
    const isValid = this.pageState.isAllRequirementsValid;

    if (isValid) {
      this.widgets.syncButton?.hide();
      this.widgets.continueButton?.show();
    } else {
      this.widgets.continueButton?.hide();
      this.widgets.syncButton?.show();
    }
  }

  _updateNavigationButtons() {
    const currentPage = this.pageState.getCurrentPageIndex();

    this.widgets.leftNavButton?.update({
      isEnabled: this.pageState.canNavigateLeft(),
      pageIndex: currentPage,
    });

    this.widgets.rightNavButton?.update({
      isEnabled: this.pageState.canNavigateRight(),
      pageIndex: currentPage,
    });
  }
}
