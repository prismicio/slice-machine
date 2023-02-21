import { BaseDrawer } from "./baseDrawer";

export class SoftDeleteDocumentsDrawer extends BaseDrawer {
  constructor() {
    super("Confirm deletion");
  }

  getAssociatedDocuments(ctName) {
    return this.root.get(`[data-cy='AssociatedDocumentsCard-${ctName}']`)
  }

  get pushButton() {
    return this.root.contains("button", "Push changes");
  }

  confirmDelete() {
    this.root.contains("label", "Delete these Documents").click();
    this.pushButton.click();

    return this;
  }
}