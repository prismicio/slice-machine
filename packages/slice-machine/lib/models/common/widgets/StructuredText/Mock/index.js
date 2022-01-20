import faker from "faker";
import { LoremIpsum } from "lorem-ipsum";
import { handleMockConfig as generateImageMock } from "../../Image/Mock";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
const isHeading = (type) => type.indexOf("heading") === 0;

export const DEFAULT_PATTERN_KEY = "PARAGRAPH";

export const LoremDefaultConfig = {
  sentencesPerParagraph: {
    min: 1,
    max: 3,
  },
  wordsPerSentence: {
    min: 4,
    max: 16,
  },
};

const optionalType = (options, type) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  options.find((e) => e === type) && Math.random() > 0.5 ? [type] : [];

export const Patterns = {
  PARAGRAPH: {
    title: "Simple Paragraph",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    test: (options) => options.some((e) => e === "paragraph"),
    value: () => ["paragraph"],
    description: "A single paragraph with a variant number of words.",
  },
  HEADING: {
    title: "Section Title",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    test: (options) => options.some(isHeading),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    value: (options) => [options.find(isHeading) || "heading1"],
    description: "A single heading (h1 to h6) with a variant number of words.",
  },
  STORY: {
    title: "Story",
    test: (options) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      options.some(isHeading) && options.some((e) => e === "paragraph"),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    value: (options) => [
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      options.find(isHeading) || "heading1",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ...optionalType(options, "image"),
      "paragraph",
    ],
    description: "Content with headings, texts and optional images",
  },
};

const findMatchingPattern = (options) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const PatternEntry = Object.entries(Patterns).find(([key, patt]) =>
    patt.test(options)
  );
  if (PatternEntry && PatternEntry.length) {
    return PatternEntry[1];
  }
  return Patterns[DEFAULT_PATTERN_KEY];
};

const isTextType = (type) => type === "paragraph" || isHeading(type);
const handleText = (contentType, loremConfig) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const lorem = new LoremIpsum(loremConfig);
  if (isHeading(contentType)) {
    const fake = faker.company.bs();
    return [fake[0].toUpperCase(), ...fake.slice(1)].join("");
  }
  return lorem.generateParagraphs(1);
};

const createMockFromConfig = (blocksLen, pattern, loremConfig) => {
  const content = Array(blocksLen)
    .fill()
    .map(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      return pattern.map((contentType) => {
        if (isTextType(contentType)) {
          return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            type: contentType,
            text: handleText(contentType, loremConfig),
            spans: [],
          };
        }
        if (contentType === "image") {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const res = generateImageMock(null, {});
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            type: contentType,
            ...res,
          };
        }
      });
    });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return content.flat();
};

export const handleMockConfig = (mockConfigValues, fieldConfig) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
  const options = (fieldConfig.multi || fieldConfig.single).split(",");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const patternType = mockConfigValues ? mockConfigValues.patternType : null;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const patternObj = Patterns[patternType] || findMatchingPattern(options);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const pattern = patternObj.value(options);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return createMockFromConfig(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    mockConfigValues.blocks,
    pattern,
    LoremDefaultConfig
  );
};

export const handleMockContent = (mockContent, fieldConfig) => {
  if (
    Array.isArray(mockContent) &&
    mockContent.length &&
    typeof mockContent[0] === "object"
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return mockContent;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
  const options = (fieldConfig.single || fieldConfig.multi).split(",");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
  return [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      type: options.find(isHeading) || "paragraph",
      spans: [],
      text: "...",
      ...(typeof mockContent === "object"
        ? mockContent
        : // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          { text: mockContent }),
    },
  ];
};

export const initialValues = {
  config: {
    patternType: DEFAULT_PATTERN_KEY,
    blocks: 1,
  },
};
