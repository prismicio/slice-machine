export const initialValues = null;

const randUrls = [
  "https://slicemachine.dev",
  "https://prismic.io",
  "http://google.com",
  "http://twitter.com",
];

export const handleMockConfig = () => ({
  link_type: "Web",
  url: randUrls[Math.floor(Math.random() * randUrls.length)],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleMockContent = (mockContent, _) => {
  if (typeof mockContent === "object") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return mockContent;
  }
  return {
    link_type: "Web",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    url: mockContent,
  };
};
