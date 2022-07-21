import { ComponentUI } from "@lib/models/common/ComponentUI";

export type ExtendedComponentUI = {
  component: ComponentUI;
};

export type SelectedSliceStoreType = ExtendedComponentUI | null;
