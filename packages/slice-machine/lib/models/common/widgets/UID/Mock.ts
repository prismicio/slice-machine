import faker from "faker";

export const initialValues = null;

// eslint-disable-next-line
export const handleMockConfig = () => faker.lorem.slug();

// eslint-disable-next-line
export const handleMockContent = (mockContent: unknown) => {
  if (typeof mockContent === "string") {
    return mockContent;
  }
  return handleMockConfig();
};
