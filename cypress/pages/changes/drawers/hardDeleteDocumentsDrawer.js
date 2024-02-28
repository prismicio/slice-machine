import { BaseDrawer } from "./baseDrawer";

class HardDeleteDocumentsDrawer extends BaseDrawer {
  constructor() {
    super("Manual action required");
  }

  getAssociatedDocuments(ctName) {
    return this.root.get(`[data-testid='AssociatedDocumentsCard-${ctName}']`);
  }
}

export const hardDeleteDocumentsDrawer = new HardDeleteDocumentsDrawer();
