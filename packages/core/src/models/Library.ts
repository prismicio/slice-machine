import * as t from "io-ts";
import { getOrElseW } from "fp-ts/lib/Either";
import path from "path";
import Files from "../utils/files";
import { VariationMock } from "./Variation";
import { SliceAsObject } from "./Slice";

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

export interface Component {
  from: string;
  href: string;
  pathToSlice: string;
  infos: ComponentInfo;
  model: SliceAsObject;
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
