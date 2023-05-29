export const CUSTOM_TYPES_CONFIG = {
  custom: {
    name: ({ start, plural }: CustomTypesConfigNameArgs) =>
      `${start ? "Custom" : "custom"} ${plural ? "types" : "type"}`,
    urlPathSegment: "custom-types",
    urlDynamicSegment: "customTypeId",
    hintSingle: "e.g. global nav, settings, footer",
    hintRepeatable: "e.g. side menu, testimonial, author",
    inputPlaceholder: `ID to query the custom type in the API (e.g. 'Author')`,
    blankSlateImage: "/blank-slate-custom-types.png",
    blankSlateDescription:
      "Custom types are models that your editors can use to create menus or objects in the Page Builder.",
  },
  page: {
    name: ({ start, plural }: CustomTypesConfigNameArgs) =>
      `${start ? "Page" : "page"} ${plural ? "types" : "type"}`,
    urlPathSegment: "page-types",
    urlDynamicSegment: "pageTypeId",
    blankSlateImage: "/blank-slate-page-types.png",
    hintSingle: "e.g. home, privacy policy, sign up",
    hintRepeatable: "e.g. product, landing page, blog post",
    inputPlaceholder: `ID to query the page type in the API (e.g. 'BlogPost')`,
    blankSlateDescription:
      "Page types are models that your editors will use to create website pages in the Page Builder.",
  },
};

type CustomTypesConfigNameArgs = {
  start: boolean;
  plural: boolean;
};
