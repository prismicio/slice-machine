import path from "path";
import * as t from "io-ts";
import { getOrElseW } from "fp-ts/lib/Either";

import { safeReadEntity } from "../node-utils/files";

export const LibraryMeta = {
  reader: t.exact(
    t.partial({
      name: t.string,
      version: t.string,
    })
  ),
  build(libPath: string): t.TypeOf<typeof this.reader> | undefined {
    const meta = safeReadEntity(path.join(libPath, "meta.json"), (payload) => {
      return getOrElseW(() => null)(LibraryMeta.reader.decode(payload));
    });
    if (!meta) return;

    return {
      name: meta.name,
      version: meta.version,
    };
  },
};

export type LibraryMeta = t.TypeOf<typeof LibraryMeta.reader>;
