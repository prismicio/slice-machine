import { Timestamp } from "../../../../../mock/misc/widgets";
import { createDefaultHandleMockContentFunction } from "../../../../../utils";

export const initialValues = null;

export const handleMockConfig = () =>
  Timestamp.handleMockConfig().split("T")[0];

export const handleMockContent = createDefaultHandleMockContentFunction(
  { handleMockConfig },
  "Date",
  (v) => v
);
