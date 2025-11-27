import * as hmUI from "@zos/ui";

/**
 * Base class for all widgets. Handles lifecycle state management and provides
 * a consistent interface for building, showing, hiding, updating, and destroying widgets.
 *
 * External callers use: build(), show(), hide(), update(), destroy(), updateView()
 * Subclasses override: onBuild(), onShow(), onHide(), onUpdate(), onDestroy(), onUpdateView()
 */
export class BaseWidget {
  constructor({ parentWidget, pageState }) {
    this.parentWidget = parentWidget;
    this.pageState = pageState;

    this.state = {
      isBuilt: false,
      isVisible: false,
    };

    this.widget = null;
  }

  // ─── PUBLIC API (external callers use these) ───

  build() {
    if (this.state.isBuilt) return;
    this.onBuild();
    this.state.isBuilt = true;
    this.state.isVisible = true;
    this.updateView();
  }

  show() {
    if (!this.state.isBuilt || this.state.isVisible) return;
    this._setVisibility(true);
    this.onShow();
    this.state.isVisible = true;
  }

  hide() {
    if (!this.state.isBuilt || !this.state.isVisible) return;
    this._setVisibility(false);
    this.onHide();
    this.state.isVisible = false;
  }

  update(props) {
    if (!this.state.isBuilt) {
      this.build();
      return;
    }
    this.onUpdate(props);
    this.updateView();
  }

  destroy() {
    if (!this.state.isBuilt) return;
    this.onDestroy();
    this._destroyWidget();
    this.state.isBuilt = false;
    this.state.isVisible = false;
  }

  updateView() {
    if (!this.state.isBuilt) return;
    this.onUpdateView();
  }

  // ─── SUBCLASS IMPLEMENTS (override these) ───

  onBuild() {
    // create widgets, etc.
  }

  onUpdateView() {
    //  sync state to UI elements.
  }

  // eslint-disable-next-line no-unused-vars
  onUpdate(props) {
    // subclass can override to merge props
  }

  onDestroy() {
    // subclass can override for cleanup (unbind events, destroy children)
  }

  onShow() {
    // subclass can override for extra show logic
  }

  onHide() {
    // subclass can override for extra hide logic
  }

  // ─── PRIVATE HELPERS ───

  _setVisibility(visible) {
    this.widget?.setProperty(hmUI.prop.VISIBLE, visible);
  }

  _destroyWidget() {
    if (this.widget) {
      hmUI.deleteWidget(this.widget);
      this.widget = null;
    }
  }
}
