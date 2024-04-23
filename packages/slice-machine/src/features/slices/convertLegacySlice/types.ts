import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { LibraryUI } from "@/legacy/lib/models/common/LibraryUI";

import { NonSharedSliceCardProps } from "../sliceCards/NonSharedSliceCard";

export type ConvertLegacySliceAndTrackArgs = {
  libraryID: string;
  sliceID: string;
  variationID?: string;
  variationName?: string;
};

const legacySliceConversionTypes = [
  "as_new_slice",
  "as_new_variation",
  "merge_with_identical",
] as const;
export type LegacySliceConversionType =
  (typeof legacySliceConversionTypes)[number];

export type IdenticalSlice = {
  libraryID: string;
  sliceID: string;
  variationID: string;
  path: string;
};

export type DialogProps = {
  isOpen: boolean;
  close: () => void;
  onSubmit: (args: ConvertLegacySliceAndTrackArgs) => void;
  isLoading: boolean;
  sliceName: string;
  libraries: readonly LibraryUI[];
  localSharedSlices: ComponentUI[];
  identicalSlices: IdenticalSlice[];
} & Pick<NonSharedSliceCardProps, "path" | "slice">;
