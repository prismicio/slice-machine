import { LibraryUI } from "@models/common/LibraryUI";
import { SliceSM } from "@core/models";

export type SlicesStoreType = {
  libraries: ReadonlyArray<LibraryUI>;
  remoteSlices: ReadonlyArray<SliceSM>;
};
