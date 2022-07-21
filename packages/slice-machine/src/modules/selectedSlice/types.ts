import { ComponentUI } from "@lib/models/common/ComponentUI";
import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";
import { VariationSM } from "@slicemachine/core/build/models";

export type ExtendedComponentUI = {
  component: ComponentUI;
  mockConfig: CustomTypeMockConfig;
  remoteVariations: ReadonlyArray<VariationSM>;
};

export type SelectedSliceStoreType = ExtendedComponentUI | null;
