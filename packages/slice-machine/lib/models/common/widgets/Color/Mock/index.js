import { createDefaultHandleMockContentFunction } from "../../../../../utils";

export const initialValues = null;

const hexLetters = "0123456789abcdef";

function getRandomColor() {
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += hexLetters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export const handleMockConfig = () => {
  return getRandomColor();
};

export const handleMockContent = createDefaultHandleMockContentFunction(
  { handleMockConfig },
  "Color",
  (v) => v.indexOf("#") === 0 && v.length === 7
);
