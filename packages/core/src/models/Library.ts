import * as t from "io-ts";
import { getOrElseW } from "fp-ts/lib/Either";
import path from "path";
import Files from "../utils/files";
import { VariationAsObject, VariationMock } from "./Variation";
import { SliceAsObject } from "./Slice";

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

  screenshotPaths?: {
    [variationId: string]: Screenshot;
  };
  meta: ComponentMetadata;
  mock?: ReadonlyArray<VariationMock>;
}

export const ComponentInfo = {
  hasPreviewsMissing(
    infos: ComponentInfo,
    variations: VariationAsObject[]
  ): boolean {
    const { screenshotPaths } = infos;
    if (!screenshotPaths) return true;
    if (Object.keys(screenshotPaths).length != variations.length) return true; // missing at least one screenshot.
    return false;
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
  path?: string;
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
