import * as t from "io-ts";
import { SliceSM } from "./Slice";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

export const LibraryMeta = {
  reader: t.exact(
    t.partial({
      name: t.string,
      version: t.string,
    })
  ),
};

export type LibraryMeta = t.TypeOf<typeof LibraryMeta.reader>;

export interface ComponentInfo {
  fileName: string | null;
  extension: string | null;
  model: SliceSM;
  screenshots: {
    [variationId: string]: Screenshot;
  };
  mocks?: SharedSliceContent[];
}

export const ComponentInfo = {
  hasPreviewsMissing(info: ComponentInfo): boolean {
    const { screenshots, model } = info;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!screenshots) return true;
    return (
      model.variations
        .map((v) => v.id)
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        .some((variationId) => !screenshots[variationId])
    );
  },
};

export interface Component extends ComponentInfo {
  from: string;
  href: string;
  pathToSlice: string;
}

export interface Screenshot {
  hash?: string;
}
export interface Library<C extends Component> {
  name: string;
  path: string;
  isLocal: boolean;
  components: ReadonlyArray<C>;
  meta?: LibraryMeta;
}
