import * as Widgets from "./misc/widgets";

import { snakelize } from "../utils/str";

import { handleFields } from "./misc/handlers";

const createEmptyMock = (sliceName, variation) => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  variation: variation.id,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  name: variation.name,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
  slice_type: snakelize(sliceName),
  items: [],
  primary: {},
});

// eslint-disable-next-line @typescript-eslint/require-await
export default async function MockSlice(sliceName, model, mockConfig) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const variations = model.variations.map((variation) => {
    const mock = createEmptyMock(sliceName, variation);
    const handler = handleFields(Widgets);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
    const maybeMockConfig = mockConfig?.[variation.id]?.primary;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mock.primary = handler(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      Object.entries(variation.primary || {}),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      maybeMockConfig || {}
    );

    const items = [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const repeat = Object.entries(variation.items || {});
    if (repeat.length === 0) {
      return {
        ...mock,
        items,
      };
    }

    for (let i = 0; i < Math.floor(Math.random() * 6) + 2; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      items.push(handler(repeat, mockConfig ? mockConfig.items || {} : {}));
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mock.items = items;
    return mock;
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return variations;
}
