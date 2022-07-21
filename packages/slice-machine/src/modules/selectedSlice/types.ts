import { ComponentUI } from "@lib/models/common/ComponentUI";
import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";

export type ExtendedComponentUI = {
  component: ComponentUI;
  mockConfig: CustomTypeMockConfig;
};

export type SelectedSliceStoreType = ExtendedComponentUI | null;
