import type Models from "@slicemachine/core/build/src/models";

// @ts-ignore
import { pascalize } from "../../utils/str";

import { ComponentUI } from "./ComponentUI";
import { BackendEnvironment } from "./Environment";

const LibraryUIMeta = {
  build(isLocal: boolean, libMeta?: Models.LibraryMeta) {
    const libName = libMeta?.name;

    const baseMeta = {
      isNodeModule: !isLocal,
      isDownloaded: isLocal && Boolean(libName),
      isManual: isLocal && !Boolean(libName),
    };

    if (!libMeta) return baseMeta;

    return {
      ...libMeta,
      isNodeModule: !isLocal,
      isDownloaded: isLocal && Boolean(libMeta.name),
      isManual: isLocal && !Boolean(libMeta.name),
    };
  },
};

interface LibraryUIMeta extends Models.LibraryMeta {
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
    env: BackendEnvironment
  ): LibraryUI {
    const components = lib.components.map((c) =>
      ComponentUI.build(c, remoteSlices, env)
    );
    const meta = LibraryUIMeta.build(lib.isLocal, lib.meta);

    return {
      ...lib,
      components,
      meta,
    };
  },
};
