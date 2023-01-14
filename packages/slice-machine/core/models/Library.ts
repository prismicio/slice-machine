import * as t from "io-ts";
import { SliceSM } from "./Slice";
import type { LibraryMeta } from "../libraries";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

export type { LibraryMeta } from "../libraries";

export const ComponentMocks = t.array(SharedSliceContent);
export type ComponentMocks = t.TypeOf<typeof ComponentMocks>;
export interface ComponentInfo {
  fileName: string | null;
  extension: string | null;
  model: SliceSM;
  screenshots: {
    [variationId: string]: Screenshot;
  };
  mock?: ComponentMocks;
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
