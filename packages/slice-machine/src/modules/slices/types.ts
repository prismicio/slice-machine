import { LibraryUI } from "@models/common/LibraryUI";
import { SliceSM } from "@prismic-beta/slicemachine-core/build/models";

export type SlicesStoreType = {
  libraries: ReadonlyArray<LibraryUI>;
  remoteSlices: ReadonlyArray<SliceSM>;
};
