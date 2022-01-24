import { createDefaultHandleMockContentFunction } from "../../../../../utils";

export const initialValues = null;

export const handleMockConfig = (_, config) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (config.default_value && Math.random() < 0.5) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return config.default_value;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const index = Math.floor(Math.random() * config.options.length);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return config.options[index];
};

export const handleMockContent = createDefaultHandleMockContentFunction(
  { handleMockConfig },
  "Select",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  (v, config) => typeof v === "string" && config.options.indexOf(v) !== -1
);
