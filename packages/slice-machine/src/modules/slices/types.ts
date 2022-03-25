import { LibraryUI } from "@models/common/LibraryUI";
import { SliceSM } from "@slicemachine/core/build/src/models";

export type SlicesStoreType = {
  libraries: ReadonlyArray<LibraryUI>;
  remoteSlices: ReadonlyArray<SliceSM>;
};
