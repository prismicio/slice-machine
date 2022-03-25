import { VariationMock } from "./Variation";
import { SliceAsObject } from "./Slice";
import type { LibraryMeta } from "../libraries";

export type { LibraryMeta } from "../libraries";
export interface ComponentInfo {
  fileName: string | null;
  extension: string | null;
  model: SliceAsObject;
  screenshotPaths: {
    [variationId: string]: Screenshot;
  };
  mock?: ReadonlyArray<VariationMock>;
}

export const ComponentInfo = {
  hasPreviewsMissing(info: ComponentInfo): boolean {
    const { screenshotPaths, model } = info;
    if (!screenshotPaths) return true;
    return model.variations
      .map((v) => v.id)
      .some((variationId) => !screenshotPaths[variationId]);
  },
};

export interface Component extends ComponentInfo {
  from: string;
  href: string;
  pathToSlice: string;
}

export interface Screenshot {
  path: string;
}
export interface Library<C extends Component> {
  name: string;
  path: string;
  isLocal: boolean;
  components: ReadonlyArray<C>;
  meta?: LibraryMeta;
}
