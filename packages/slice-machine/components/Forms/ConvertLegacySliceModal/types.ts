import { CompositeSlice } from "@prismicio/types-internal/lib/customtypes";

import { LibraryUI } from "@models/common/LibraryUI";
import { ComponentUI } from "@models/common/ComponentUI";
import { SliceZoneSlice } from "@models/common/CustomType/sliceZone";
import ModalFormCard from "@components/ModalFormCard";

export type FormValues = {
  tab?: Tab;
  sliceName: string;
  from: string;
  asNewVariation_libraryID: string;
  asNewVariation_sliceID: string;
  asNewVariation_variationID: string;
  asNewVariation_variationName: string;
  // `<libraryID>::<sliceID>::<variationID>`
  mergeWithIdentical_path: "" | `${string}::${string}::${string}`;
};

export type ConvertLegacySliceModalProps = {
  isOpen: boolean;
  close: () => void;
  slice: { key: string; value: CompositeSlice };
  slices: readonly SliceZoneSlice[];
  path: {
    customTypeID: string;
    tabID: string;
    sliceZoneID: string;
  };
};

type Formik = Parameters<
  Parameters<typeof ModalFormCard<FormValues>>[0]["children"]
>[0];

const tabs = ["index", "as_new_variation", "as_new_slice"] as const;
export type Tab = (typeof tabs)[number];

export type TabProps = {
  sliceName: string;
  setActiveTab: (tab: (typeof tabs)[number]) => void;
  libraries: readonly LibraryUI[];
  localSharedSlices: ComponentUI[];
  formik: Formik;
} & Pick<ConvertLegacySliceModalProps, "path" | "slice">;
