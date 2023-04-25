import { LibraryUI } from "@models/common/LibraryUI";
import { SliceSM } from "@lib/models/common/Slice";

export type SlicesStoreType = {
  libraries: ReadonlyArray<LibraryUI>;
  remoteSlices: ReadonlyArray<SliceSM>;
};
