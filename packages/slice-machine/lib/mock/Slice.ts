import { Models } from "@slicemachine/core";
import * as Widgets from "./misc/widgets";
import { handleFields } from "./misc/handlers";
import { FieldsSM } from "@slicemachine/core/build/models/Fields";
import { SliceSM, VariationSM } from "@slicemachine/core/build/models/Slice";

const createEmptyMock = (
  sliceId: string,
  variation: VariationSM
): Models.VariationMock => ({
  variation: variation.id,
  name: variation.name,
  slice_type: sliceId,
  items: [],
  primary: {},
});

export default function MockSlice(
  model: SliceSM,
  mockConfig: Record<string, Record<string, Record<string, unknown>>> // not sure about this one.
): Models.SliceMock {
  const handler: (
    fields?: FieldsSM,
    mocks?: Record<string, unknown>
  ) => Record<string, unknown> = handleFields(Widgets);

  const variations = model.variations.map((variation) => {
    const mock = createEmptyMock(model.id, variation);

    const maybeMockConfigPrimary = mockConfig?.[variation.id]?.primary || {};
    const maybeMockConfigItems = mockConfig?.[variation.id]?.items || {};

    mock.primary = handler(variation.primary, maybeMockConfigPrimary);

    const items: Models.VariationMock["items"] = [];

    const repeat = variation.items;
    if (!repeat || (repeat && repeat.length === 0)) {
      return {
        ...mock,
        items,
      };
    }

    for (let i = 0; i < Math.floor(Math.random() * 6) + 2; i++) {
      items.push(handler(repeat, maybeMockConfigItems));
    }

    mock.items = items;
    return mock;
  });

  return variations;
}
