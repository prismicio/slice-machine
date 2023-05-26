export const CUSTOM_TYPES_CONFIG = {
  custom: {
    title: "Custom Types",
    name: "Custom Type",
    urlPathSegment: "custom-types",
    urlDynamicSegment: "customTypeId",
    hintSingle: "TODO",
    hintRepeatable: "TODO",
    inputPlaceholder: `ID to query the Custom Type in the API (e.g. 'Author')`,
    blankSlateImage: "/blank-slate-custom-types.png",
    blankSlateDescription: "TODO",
  },
  page: {
    title: "Page Types",
    name: "Page Type",
    urlPathSegment: "page-types",
    urlDynamicSegment: "pageTypeId",
    blankSlateImage: "/blank-slate-page-types.png",
    hintSingle: "e.g. home, privacy policy, sign up",
    hintRepeatable: "e.g. product, landing page, blog post",
    inputPlaceholder: `ID to query the Page Type in the API (e.g. 'BlogPost')`,
    blankSlateDescription:
      "Page types are models that your editors will use to create website pages in the Page Builder.",
  },
};
