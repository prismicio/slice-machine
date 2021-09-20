export const initialValues = null;

export const handleMockConfig = () => ({
  link_type: "media",
  url: "https://source.unsplash.com/daily",
});

export const handleMockContent = (mockContent, _) => {
  if (typeof mockContent === "object") {
    return mockContent;
  }

  return {
    link_type: "media",
    url: mockContent,
  };
};
