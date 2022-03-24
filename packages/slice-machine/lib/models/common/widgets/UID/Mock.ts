import faker from "@faker-js/faker";

export const initialValues = null;

export const handleMockConfig = () => faker.lorem.slug();

export const handleMockContent = (mockContent: unknown) => {
  if (typeof mockContent === "string") {
    return mockContent;
  }
  return handleMockConfig();
};
