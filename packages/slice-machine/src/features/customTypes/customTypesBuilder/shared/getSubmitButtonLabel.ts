export const getSubmitButtonLabel = (
  location: "custom_type" | "page_type",
  typeName?: string,
) => {
  switch (location) {
    case "custom_type":
    case "page_type":
      return `Add to ${typeName}`;
  }
};
