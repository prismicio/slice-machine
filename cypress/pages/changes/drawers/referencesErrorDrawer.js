import { BaseDrawer } from "./baseDrawer";

class ReferencesErrorDrawer extends BaseDrawer {
  constructor() {
    super("Missing Slices");
  }

  getCustomTypeReferencesCard(ctName) {
    return this.root.get(`[data-cy='CustomTypesReferencesCard-${ctName}']`);
  }
}

export const referencesErrorDrawer = new ReferencesErrorDrawer();
