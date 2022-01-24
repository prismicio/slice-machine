import { Computer } from "./dataset";

export const initialValues = null;

const createImageArray = (
  { src: intialSrc },
  constraint = {},
  thumbnails = []
) => {
  const { width = 900, height = 500 } = constraint;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const src =
    intialSrc ||
    Computer[Math.floor(Math.random() * Computer.length)].raw.split("?")[0];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
    dimensions: { width, height },
    alt: "Placeholder image",
    copyright: null,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions, @typescript-eslint/restrict-template-expressions, @typescript-eslint/restrict-template-expressions
    url: `${src}?w=${width}&h=${height}&fit=crop`,
    ...thumbnails.reduce(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-return
      (acc, e, i) => ({
        ...acc,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        [e.name]: createImageArray(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          { src },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          { width: e.width, height: e.height }
        ),
      }),
      []
    ),
  };
};

export const handleMockContent = (mockContent, { constraint, thumbnails }) => {
  if (Array.isArray(mockContent)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return mockContent;
  }
  const args = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      src: mockContent,
    },
    constraint,
    thumbnails,
  ];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
  return createImageArray(...args);
};
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
export const handleMockConfig = (_, model) => handleMockContent(null, model);
