import { VariationMock } from "./Variation";
import { SliceAsObject } from "./Slice";
import type { LibraryMeta } from "../libraries";

export type { LibraryMeta } from "../libraries";
export interface ComponentInfo {
  sliceName: string;
  fileName: string | null;
  isDirectory: boolean;
  extension: string | null;
  model: SliceAsObject;
  nameConflict: {
    sliceName: string;
    id: string;
  } | null;

  screenshotPaths: {
    [variationId: string]: Screenshot;
  };
  meta: ComponentMetadata;
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

export interface ComponentMetadata {
  id: string;
  name?: string;
  description?: string;
}
export interface Component {
  from: string;
  href: string;
  pathToSlice: string;
  infos: ComponentInfo;
  model: SliceAsObject;
  migrated: boolean;
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
