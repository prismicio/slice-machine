import { ComponentUI, ScreenshotUI } from "@lib/models/common/ComponentUI";
import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";
import { VariationSM } from "@slicemachine/core/build/models";

export type ExtendedComponentUI = {
  component: ComponentUI;
  mockConfig: CustomTypeMockConfig;
  initialMockConfig: CustomTypeMockConfig;
  remoteVariations: ReadonlyArray<VariationSM>;
  initialVariations: ReadonlyArray<VariationSM>;
  initialScreenshotUrls?: { [variationId: string]: ScreenshotUI };
  isTouched?: boolean;
};

export type SelectedSliceStoreType = ExtendedComponentUI | null;
