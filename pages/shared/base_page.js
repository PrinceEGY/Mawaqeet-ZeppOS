/**
 * Base class for all pages. Handles lifecycle state management and provides
 * a consistent interface for initializing, building, showing, hiding, updating, and destroying pages.
 *
 * External callers use: init(), build(), show(), hide(), update(), destroy()
 * Subclasses override: onInit(), onBuild(), onShow(), onHide(), onUpdate(), onDestroy()
 */
export class BasePage {
  constructor(globalState) {
    this.globalState = globalState;
    this.pageState = null;
    this.widgets = {};
    this.isBuilt = false;
    this.isVisible = false;
  }

  // ─── PUBLIC API (external callers use these) ───

  init() {
    this.onInit();
  }

  build() {
    if (this.isBuilt) return;
    this.onBuild();
    Object.values(this.widgets).forEach((w) => w.build());
    this.isBuilt = true;
  }

  show() {
    if (!this.isBuilt || this.isVisible) return;
    Object.values(this.widgets).forEach((w) => w.show());
    this.onShow();
    this.isVisible = true;
  }

  hide() {
    if (!this.isVisible) return;
    Object.values(this.widgets).forEach((w) => w.hide());
    this.onHide();
    this.isVisible = false;
  }

  update() {
    if (!this.isBuilt) return;
    this.onUpdate();
    Object.values(this.widgets).forEach((w) => w.update());
  }

  updateView() {
    if (!this.isBuilt) return;
    this.onUpdateView();
    Object.values(this.widgets).forEach((w) => w.updateView());
  }

  refresh() {
    if (!this.isBuilt) return;
    this.onRefresh();
  }

  destroy() {
    this.onDestroy();
    Object.values(this.widgets).forEach((w) => w.destroy());
    this.pageState?.destroy?.();
    this.widgets = {};
    this.isBuilt = false;
    this.isVisible = false;
  }

  // ─── SUBCLASS IMPLEMENTS (override these) ───

  onInit() {
    // create pageState and initialize data, etc.
  }

  onBuild() {
    // create widgets, etc.
  }

  onShow() {
    //  extra show logic if needed.
  }

  onHide() {
    //  extra hide logic if needed.
  }

  onUpdate() {
    //  extra update logic if needed.
  }

  onRefresh() {
    // extra refresh logic if needed.
  }

  onUpdateView() {
    //  extra updateView logic if needed.
  }

  onDestroy() {
    //  cleanup (unbind events, etc.)
  }
}
