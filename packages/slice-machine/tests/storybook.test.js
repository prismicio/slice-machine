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

test("Can create Storybook url from variation id", () => {
  console.log("DOES SB NEED TO BE TESTED?");
});
