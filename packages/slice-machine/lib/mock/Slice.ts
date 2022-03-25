import { Models } from "@slicemachine/core";
import * as Widgets from "./misc/widgets";
import { snakelize } from "../utils/str";
import { handleFields } from "./misc/handlers";
import { FieldsSM } from "@slicemachine/core/build/src/models/Fields";
import {
  SliceSM,
  VariationSM,
} from "@slicemachine/core/build/src/models/Slice";

const createEmptyMock = (
  sliceName: string,
  variation: VariationSM
): Models.VariationMock => ({
  variation: variation.id,
  name: variation.name,
  slice_type: snakelize(sliceName),
  items: [],
  primary: {},
});

export default function MockSlice(
  sliceName: string,
  model: SliceSM,
  mockConfig: Record<string, Record<string, Record<string, unknown>>> // not sure about this one.
): Models.SliceMock {
  const variations = model.variations.map((variation) => {
    const mock = createEmptyMock(sliceName, variation);
    const handler: (
      fields?: FieldsSM,
      mocks?: Record<string, unknown>
    ) => Models.VariationMock["primary"] = handleFields(Widgets);

    const maybeMockConfig = mockConfig?.[variation.id]?.primary || {};
    mock.primary = handler(variation.primary, maybeMockConfig);

    const items: Models.VariationMock["items"] = [];

    const repeat = variation.items;
    if (!repeat || (repeat && repeat.length === 0)) {
      return {
        ...mock,
        items,
      };
    }

    for (let i = 0; i < Math.floor(Math.random() * 6) + 2; i++) {
      items.push(handler(repeat, mockConfig ? mockConfig.items || {} : {}));
    }

    mock.items = items;
    return mock;
  });

  return variations;
}
