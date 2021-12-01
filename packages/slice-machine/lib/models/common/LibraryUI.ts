import path from "path";
import * as t from "io-ts";
import type { Models } from "@slicemachine/models";

// @ts-ignore
import { pascalize } from "../../utils/str";

import { ComponentUI } from "./ComponentUI";
import Files from "@lib/utils/files";
import { getOrElseW } from "fp-ts/lib/Either";
import Environment from "./Environment";

const LibraryUIMeta = {
  pkgReader: t.exact(
    t.type({
      name: t.string,
    })
  ),
  build(technicalName: string, libPath: string, isLocal: boolean) {
    const pkgValue = Files.safeReadEntity(
      path.join(libPath, "package.json"),
      (payload) => {
        return getOrElseW(() => null)(LibraryUIMeta.pkgReader.decode(payload));
      }
    );
    const libName = pkgValue?.name;

    return {
      isNodeModule: !isLocal,
      isDownloaded: isLocal && Boolean(libName),
      isManual: isLocal && !Boolean(libName),
      name: libName || technicalName,
    };
  },
};

interface LibraryUIMeta {
  name: string;
  isNodeModule: boolean;
  isDownloaded: boolean;
  isManual: boolean;
}

export interface LibraryUI extends Models.Library<ComponentUI> {
  meta: LibraryUIMeta;
}

export const LibraryUI = {
  build(
    lib: Models.Library<Models.Component>,
    remoteSlices: ReadonlyArray<Models.SliceAsObject>,
    env: Environment
  ): LibraryUI {
    const components = lib.components.map((c) =>
      ComponentUI.build(c, remoteSlices, env)
    );
    const meta = LibraryUIMeta.build(lib.name, lib.path, lib.isLocal);

    return {
      ...lib,
      components,
      meta,
    };
  },
};
