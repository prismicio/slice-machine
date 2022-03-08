import { LibraryUI } from "@models/common/LibraryUI";
import type { Models } from "@slicemachine/core";

export type SlicesStoreType = {
  libraries: ReadonlyArray<LibraryUI>;
  remoteSlices: ReadonlyArray<Models.SliceAsObject>;
};
