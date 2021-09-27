import { createDefaultHandleMockContentFunction } from "../../../../../utils";

export const initialValues = null;

export const handleMockConfig = () => {
  return Math.random() < 0.5 ? true : false;
};

export const handleMockContent = createDefaultHandleMockContentFunction(
  { handleMockConfig },
  "Boolean",
  (v) => typeof v === "boolean"
);
