import * as t from "io-ts";
import path from "path";
import { getOrElseW } from "fp-ts/lib/Either";
import { Files } from "../node-utils";
import type { SharedSliceContent } from "@prismicio/types-internal/lib/documents/widgets/slices/SharedSliceContent";
import { SliceSM } from "./Slice";

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

export const SharedSliceReader = new t.Type<SharedSliceContent>(
  "SharedSliceContent",
  (s): s is SharedSliceContent =>
    "SharedSliceContent" === (s as { __TYPE__?: string }).__TYPE__,
  (s, c) => {
    if ("SharedSliceContent" === (s as { __TYPE__?: string }).__TYPE__)
      return t.success(s as SharedSliceContent);
    else return t.failure(s, c);
  },
  (s) => s
);

export const ComponentMocks = t.array(SharedSliceReader);
export type ComponentMocks = t.TypeOf<typeof ComponentMocks>;
export interface ComponentInfo {
  fileName: string | null;
  extension: string | null;
  model: SliceSM;
  screenshotPaths: {
    [variationId: string]: Screenshot;
  };
  mock?: ComponentMocks;
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
