import { SliceSM } from "@lib/models/common/Slice";
import { LibraryUI } from "@models/common/LibraryUI";

export type SlicesStoreType = {
  libraries: ReadonlyArray<LibraryUI>;
  remoteSlices: ReadonlyArray<SliceSM>;
};
