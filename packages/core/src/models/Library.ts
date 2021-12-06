import * as t from "io-ts";
import { getOrElseW } from "fp-ts/lib/Either";
import path from "path";
import Files from "../utils/files";
import { VariationMock } from "./Variation";
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
  hasPreviewsMissing(infos: ComponentInfo): boolean {
    const { screenshotPaths } = infos;
    if (!screenshotPaths) return true;

    return Object.entries(screenshotPaths).reduce(
      (acc: boolean, [, screenshot]: [string, Screenshot]) => {
        return Boolean(!screenshot) || (acc && screenshot?.exists);
      },
      false
    );
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
  exists: boolean;
  path?: string;
}

export const LibraryMeta = {
  reader: t.exact(
    t.partial({
      name: t.string,
      version: t.string,
    })
  ),
  build(libPath: string) {
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
