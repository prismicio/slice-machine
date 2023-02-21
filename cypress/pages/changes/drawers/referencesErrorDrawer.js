import { BaseDrawer } from "./baseDrawer";

export class ReferencesErrorDrawer extends BaseDrawer {
  constructor() {
    super("Missing Slices");
  }

  getCustomTypeReferencesCard(ctName) {
    return this.root.get(`[data-cy='CustomTypesReferencesCard-${ctName}']`);
  }
}
