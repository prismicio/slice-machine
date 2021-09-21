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

export const handleMockContent = (mockContent, _) => {
  if (typeof mockContent === "object") {
    return mockContent;
  }
  return {
    link_type: "Web",
    url: mockContent,
  };
};
