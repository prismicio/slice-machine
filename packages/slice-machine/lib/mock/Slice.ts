import {
  SharedSlice,
  Variation,
} from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { SliceDiff } from "@prismicio/types-internal/lib/customtypes/diff/SharedSlice";
import {
  SharedSliceMockConfig,
  VariationMockConfig,
  SharedSliceMock,
} from "@prismicio/mocks";
import { buildFieldsMockConfig } from "./LegacyMockConfig";
import { ComponentMocks } from "@lib/models/common/Library";

function buildVariationMockConfig(
  model: Variation,
  legacyVariationMockConfig?: Partial<Record<string, Record<string, unknown>>>
): VariationMockConfig {
  const primaryFields =
    model.primary &&
    buildFieldsMockConfig(
      model.primary,
      legacyVariationMockConfig?.["primary"]
    );
  const itemFields =
    model.items &&
    buildFieldsMockConfig(model.items, legacyVariationMockConfig?.["items"]);
  return {
    nbItemsBlocks: 1,
    primaryFields,
    itemFields,
  };
}

export default function MockSlice(
  sliceModel: SharedSlice,
  previousMocks?: ComponentMocks | null | undefined,
  sliceDiff?: SliceDiff | undefined
): ComponentMocks {
  return []
  // return sliceModel.variations.map((variation) => {
  //   const variationMock = previousMocks?.find(
  //     (m) => m.variation === variation.id
  //   );

  //   if (!variationMock) {
  //     return SharedSliceMock.generate(sliceModel);
  //   }

  //   if (!sliceDiff) return variationMock;

  //   const patched = SharedSliceMock.patch(
  //     sliceDiff,
  //     sliceModel,
  //     variationMock,
  //   );

  //   if (!patched.ok) {
  //     return variationMock;
  //   }

  //   if (!patched.result) {
  //     return SharedSliceMock.generate(sliceModel);
  //   }

  // })
}
