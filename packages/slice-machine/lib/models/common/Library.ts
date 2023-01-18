import path from "path";
import * as t from "io-ts";
import { getOrElseW } from "fp-ts/lib/Either";
import { SliceSM } from "./Slice";
import Files from "@lib/utils/files";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

export const LibraryMeta = {
  reader: t.exact(
    t.partial({
      name: t.string,
      version: t.string,
    })
  ),
  build(libPath: string): t.TypeOf<typeof this.reader> | undefined {
    const meta = Files.safeReadEntity(
      path.join(libPath, "meta.json"),
      (payload) => {
        return getOrElseW(() => null)(LibraryMeta.reader.decode(payload));
      }
    );
    if (!meta) return;

    return {
      name: meta.name,
      version: meta.version,
    };
  },
};

export type LibraryMeta = t.TypeOf<typeof LibraryMeta.reader>;

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
