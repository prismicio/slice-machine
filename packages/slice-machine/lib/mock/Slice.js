import * as Widgets from "./misc/widgets";

import { snakelize } from "../utils/str";

import { handleFields } from "./misc/handlers";

const createEmptyMock = (sliceName, variation) => ({
  variation: variation.id,
  name: variation.name,
  slice_type: snakelize(sliceName),
  items: [],
  primary: {},
});

export default async function MockSlice(sliceName, model, mockConfig) {
  const variations = model.variations.map((variation) => {
    const mock = createEmptyMock(sliceName, variation);
    const handler = handleFields(Widgets);

    const maybeMockConfig = mockConfig?.[variation.id]?.primary;

    mock.primary = handler(
      Object.entries(variation.primary || {}),
      maybeMockConfig || {}
    );

    const items = [];
    const repeat = Object.entries(variation.items || {});
    if (repeat.length === 0) {
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
