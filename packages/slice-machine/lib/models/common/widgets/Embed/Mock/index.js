import dataset from "./dataset";

export const initialValues = null;

export const handleMockConfig = () => {
  return dataset[Math.floor(Math.random() * dataset.length)].oembed;
};

export const handleMockContent = (v) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
  if (typeof v === "object" && v.url && v.oembed) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return v.oembed;
  }
  return handleMockConfig();
};
