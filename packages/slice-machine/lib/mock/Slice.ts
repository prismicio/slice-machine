import { Models } from "@slicemachine/core";
import {
  SharedSlice,
  SlicesTypes,
  Variation,
} from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import {
  SharedSliceMockConfig,
  VariationMockConfig,
  generateSliceMock,
} from "@prismicio/mocks";
import { buildFieldsMockConfig, PartialRecord } from "./LegacyMockConfig";

function buildVariationMockConfig(
  model: Models.VariationAsObject,
  legacyVariationMockConfig?: PartialRecord<Record<string, unknown>>
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
  model: Models.SliceAsObject,
  legacyMockConfig: PartialRecord<PartialRecord<PartialRecord<unknown>>>
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
  model: Models.SliceAsObject,
  legacyMockConfig: Record<string, Record<string, Record<string, unknown>>> // not sure about this one.
): Models.ComponentMocks {
  const sliceMockConfig = buildSliceMockConfig(model, legacyMockConfig);
  const sliceModel: SharedSlice = {
    ...model,
    variations: model.variations.map((v) => {
      return {
        ...v,
        imageUrl: "",
      } as Variation;
    }),
    type: SlicesTypes.SharedSlice,
  };
  return sliceMockConfig.map((sc) =>
    generateSliceMock(sliceModel, sc)()
  ) as Models.ComponentMocks;
}
