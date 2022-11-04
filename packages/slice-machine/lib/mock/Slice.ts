import {
  SharedSlice,
  Variation,
} from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import {
  SharedSliceMockConfig,
  VariationMockConfig,
  SharedSliceMock,
} from "@prismicio/mocks";
import { buildFieldsMockConfig } from "./LegacyMockConfig";
import { Slices, SliceSM } from "@slicemachine/core/build/models/Slice";
import { ComponentMocks } from "@slicemachine/core/build/models";

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

export function buildSliceMockConfig(
  model: SharedSlice,
  legacyMockConfig: Partial<
    Record<string, Partial<Record<string, Partial<Record<string, unknown>>>>>
  >
): ReadonlyArray<SharedSliceMockConfig> {
  const variationConfigs: Record<string, VariationMockConfig> =
    model.variations.reduce((acc, variationModel) => {
      const variationMockConfig = legacyMockConfig[variationModel.id];
      return {
        ...acc,
        [variationModel.id]: buildVariationMockConfig(
          variationModel,
          variationMockConfig
        ),
      };
    }, {});

  return model.variations.map((v) => {
    return {
      variation: v.id,
      variations: variationConfigs,
    };
  });
}

export default function MockSlice(
  smModel: SliceSM,
  legacyMockConfig: Record<string, Record<string, Record<string, unknown>>> // not sure about this one.
): ComponentMocks {
  const model = Slices.fromSM(smModel);

  const sliceMockConfig = buildSliceMockConfig(model, legacyMockConfig);
  return sliceMockConfig.map((sc) => {
    return SharedSliceMock.generate(model, sc);
  });
}
