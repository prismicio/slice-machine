type CustomTypesMessagesNameArgs = {
  start: boolean;
  plural: boolean;
};

export const CUSTOM_TYPES_MESSAGES = {
  page: {
    name: ({ start, plural }: CustomTypesMessagesNameArgs) =>
      `${start ? "Page" : "page"} ${plural ? "types" : "type"}`,
    hintSingle: "e.g. home, privacy policy, sign up",
    hintRepeatable: "e.g. product, landing page, blog post",
    inputPlaceholder: `ID to query the page type in the API (e.g. 'blogPost')`,
    blankSlateDescription:
      "Page types are models that your editors will use to create website pages in the Page Builder.",
    autoSaveFailed:
      "Failed to save page type. Check your browser's console for more information.",
  },
  custom: {
    name: ({ start, plural }: CustomTypesMessagesNameArgs) =>
      `${start ? "Custom" : "custom"} ${plural ? "types" : "type"}`,
    hintSingle: "e.g. global nav, settings, footer",
    hintRepeatable: "e.g. side menu, testimonial, author",
    inputPlaceholder: `ID to query the custom type in the API (e.g. 'author')`,
    blankSlateDescription:
      "Custom types are models that your editors can use to create menus or objects in the Page Builder.",
    autoSaveFailed:
      "Failed to save custom type. Check your browser's console for more information.",
  },
};
