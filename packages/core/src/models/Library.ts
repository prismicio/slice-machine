import { SliceOrEditorMocks, SliceSM } from "./Slice";
import type { LibraryMeta } from "../libraries";

export type { LibraryMeta } from "../libraries";
export interface ComponentInfo {
  fileName: string | null;
  extension: string | null;
  model: SliceSM;
  screenshots: {
    [variationId: string]: Screenshot;
  };
  mock?: SliceOrEditorMocks;
}

export const ComponentInfo = {
  hasPreviewsMissing(info: ComponentInfo): boolean {
    const { screenshots, model } = info;
    if (!screenshots) return true;
    return model.variations
      .map((v) => v.id)
      .some((variationId) => !screenshots[variationId]);
  },
};

export interface Component extends ComponentInfo {
  from: string;
  href: string;
  pathToSlice: string;
}

export interface Screenshot {
  path: string;
  hash: string;
}
export interface Library<C extends Component> {
  name: string;
  path: string;
  isLocal: boolean;
  components: ReadonlyArray<C>;
  meta?: LibraryMeta;
}
