import { BaseDrawer } from "./baseDrawer";

export class HardDeleteDocumentsDrawer extends BaseDrawer {
  constructor() {
    super("Manual action required");
  }

  getAssociatedDocuments(ctName) {
    return this.root.get(`[data-cy='AssociatedDocumentsCard-${ctName}']`)
  }
}