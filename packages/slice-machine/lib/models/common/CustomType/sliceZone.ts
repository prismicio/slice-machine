import {
  SlicesTypes,
  CompositeSlice,
  LegacySlice,
} from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { ComponentUI } from "../ComponentUI";

export type NonSharedSliceInSliceZone = {
  key: string;
  value: LegacySlice | CompositeSlice;
};
export interface SliceZoneSlice {
  type: SlicesTypes;
  payload: ComponentUI | NonSharedSliceInSliceZone;
}
