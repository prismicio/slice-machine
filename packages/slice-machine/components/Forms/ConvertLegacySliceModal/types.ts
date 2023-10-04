import { CompositeSlice } from "@prismicio/types-internal/lib/customtypes";

import { LibraryUI } from "@models/common/LibraryUI";
import { ComponentUI } from "@models/common/ComponentUI";

export type ConvertLegacySliceModalProps = {
  slice: { key: string; value: CompositeSlice };
  path: {
    customTypeID: string;
    tabID: string;
    sliceZoneID: string;
  };
};

export type ConvertLegacySliceAndTrackArgs = {
  libraryID: string;
  sliceID: string;
  variationID?: string;
  variationName?: string;
};

const types = [
  "as_new_slice",
  "as_new_variation",
  "merge_with_identical",
] as const;
export type Type = (typeof types)[number];

export type IdenticalSlice = {
  libraryID: string;
  sliceID: string;
  variationID: string;
  path: string;
};

export type FormProps = {
  isOpen: boolean;
  close: () => void;
  onSubmit: (args: ConvertLegacySliceAndTrackArgs) => void;
  isLoading: boolean;
  sliceName: string;
  libraries: readonly LibraryUI[];
  localSharedSlices: ComponentUI[];
  identicalSlices: IdenticalSlice[];
} & Pick<ConvertLegacySliceModalProps, "path" | "slice">;
