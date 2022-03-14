import * as t from "io-ts";
import { getOrElseW } from "fp-ts/lib/Either";
import path from "path";
import Files from "../utils/files";
import { SliceAsObject } from "./Slice";
import type { SharedSliceContent } from "@prismicio/types-internal/lib/documents/widgets/slices/SharedSliceContent";

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

export interface Library<C extends Component> {
  name: string;
  path: string;
  isLocal: boolean;
  components: ReadonlyArray<C>;
  meta?: LibraryMeta;
}
