import { LibraryUI } from "@/legacy/lib/models/common/LibraryUI";
import { SliceSM } from "@/legacy/lib/models/common/Slice";

export type SlicesStoreType = {
  libraries: ReadonlyArray<LibraryUI>;
  remoteSlices: ReadonlyArray<SliceSM>;
};
