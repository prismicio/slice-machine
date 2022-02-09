import "@testing-library/jest-dom";

import { createStorybookUrl, camelCaseToDash } from "@src/utils/storybook";

const storybook = "http://localhost:6006";
const slices = "slices";
const lowerSliceName = "myawesomez";

const variations = [
  {
    id: "my-variation",
    expectedUrl: `${storybook}/?path=/story/${slices}-${lowerSliceName}--my-variation`,
    dashed: "my-variation",
  },
  {
    id: "myVariation2",
    expectedUrl: `${storybook}/?path=/story/${slices}-${lowerSliceName}--my-variation-2`,
    dashed: "my-variation-2",
  },
  {
    id: "2MyVariation",
    expectedUrl: `${storybook}/?path=/story/${slices}-${lowerSliceName}--2-my-variation`,
    dashed: "2-my-variation",
  },
  {
    id: "myVariation20",
    expectedUrl: `${storybook}/?path=/story/${slices}-${lowerSliceName}--my-variation-20`,
    dashed: "my-variation-20",
  },
  {
    id: "myVariation2With20",
    expectedUrl: `${storybook}/?path=/story/${slices}-${lowerSliceName}--my-variation-2-with-20`,
    dashed: "my-variation-2-with-20",
  },
];

describe("storybook utils service", () => {
  describe.each(variations)("camelCaseToDash", ({ id, dashed }) => {
    it(`should transform ${id} into ${dashed}`, () => {
      expect(camelCaseToDash(id)).toBe(dashed);
    });
  });
  describe.each(variations)("createStorybookUrl", ({ id, expectedUrl }) => {
    it(`should return ${expectedUrl} with id equal to ${id}`, () => {
      const url = createStorybookUrl({
        storybook,
        libraryName: slices,
        sliceName: "MyAwesomeZ",
        variationId: id,
      });
      expect(url).toBe(expectedUrl);

      const urlWithTrailingSlash = createStorybookUrl({
        storybook: `${storybook}/`,
        libraryName: slices,
        sliceName: "MyAwesomeZ",
        variationId: id,
      });
      expect(urlWithTrailingSlash).toBe(expectedUrl);
    });
  });
});
