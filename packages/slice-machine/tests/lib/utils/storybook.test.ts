import "@testing-library/jest-dom";
import { createStorybookUrl } from "@lib/utils/storybook";

const storybook = "http://localhost:6006";
const slices = "slices";
const lowerSliceName = "myawesomez";

const variations = [
  [
    "my-variation",
    `${storybook}/?path=/story/${slices}-${lowerSliceName}--my-variation`,
  ],
  [
    "myVariation2",
    `${storybook}/?path=/story/${slices}-${lowerSliceName}--my-variation-2`,
  ],
  [
    "2MyVariation",
    `${storybook}/?path=/story/${slices}-${lowerSliceName}--2-my-variation`,
  ],
  [
    "myVariation20",
    `${storybook}/?path=/story/${slices}-${lowerSliceName}--my-variation-20`,
  ],
  [
    "myVariation2With20",
    `${storybook}/?path=/story/${slices}-${lowerSliceName}--my-variation-2-with-20`,
  ],
];

describe("screenshots", () => {
  test("Can create Storybook url from variation id", () => {
    for (const variation of variations) {
      const [id, expectedUrl] = variation;
      const url = createStorybookUrl({
        storybook,
        libraryName: slices,
        sliceName: "MyAwesomeZ",
        variationId: id,
      });
      expect(url).toBe(expectedUrl);
    }
  });

  test("Trailing slash creates same result", () => {
    for (const variation of variations) {
      const [id, expectedUrl] = variation;
      const url = createStorybookUrl({
        storybook: `${storybook}/`,
        libraryName: slices,
        sliceName: "MyAwesomeZ",
        variationId: id,
      });
      expect(url).toBe(expectedUrl);
    }
  });
});
