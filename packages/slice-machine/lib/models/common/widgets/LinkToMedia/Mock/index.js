export const initialValues = null;

export const handleMockConfig = () => ({
  link_type: "media",
  url: "https://source.unsplash.com/daily",
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleMockContent = (mockContent, _) => {
  if (typeof mockContent === "object") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return mockContent;
  }

  return {
    link_type: "media",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    url: mockContent,
  };
};
