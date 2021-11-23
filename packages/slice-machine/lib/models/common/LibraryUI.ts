import type { Models } from "@slicemachine/core";

// @ts-ignore
import { pascalize } from "../../utils/str";

import { ComponentUI } from "./ComponentUI";

export interface LibraryUIMeta {
  name: string;
}

export interface LibraryUI extends Models.Library<ComponentUI> {
  meta?: LibraryUIMeta;
}

export const LibraryUI = {
  build(
    lib: Models.Library<Models.Component>,
    remoteSlices: ReadonlyArray<Models.SliceAsObject>
  ): LibraryUI {
    const components = lib.components.map((c) =>
      ComponentUI.build(c, remoteSlices)
    );
    const meta = undefined; //TODO compute the meta in the package json of the lib either download or in node modules. If not either case, return undefined (manually created lib)

    return {
      meta,
      name: lib.name,
      isLocal: lib.isLocal,
      components,
    };
  },
};
