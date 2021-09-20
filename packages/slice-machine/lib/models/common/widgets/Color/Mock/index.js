import { createDefaultHandleMockContentFunction } from "../../../../../utils";

export const initialValues = null;

function getRandomColor() {
  const letters = "0123456789abcdef";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
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
