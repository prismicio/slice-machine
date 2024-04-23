import type { LibraryMeta, Library, Component } from "./Library";
import { ComponentUI } from "./ComponentUI";

const LibraryUIMeta = {
  build(isLocal: boolean, libMeta?: LibraryMeta) {
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

interface LibraryUIMeta extends LibraryMeta {
  isNodeModule: boolean;
  isDownloaded: boolean;
  isManual: boolean;
}

export interface LibraryUI extends Library<ComponentUI> {
  meta: LibraryUIMeta;
}

export const LibraryUI = {
  build(lib: Library<Component>): LibraryUI {
    const components = lib.components.map((c) => ComponentUI.build(c));
    const meta = LibraryUIMeta.build(lib.isLocal, lib.meta);

    return {
      ...lib,
      components,
      meta,
    };
  },
};
