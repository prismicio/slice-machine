import { createStorybookId, camelCaseToDash } from "./str";

export const sanitizeSbId = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

const createStorybookPath = ({
  libraryName,
  sliceName,
  variationId,
}: {
  libraryName: string;
  sliceName: string;
  variationId: string;
}) =>
  `${sanitizeSbId(libraryName)}-${sliceName.toLowerCase()}--${camelCaseToDash(
    createStorybookId(variationId).slice(1)
  )}`;

export const createStorybookUrl = ({
  storybook,
  libraryName,
  sliceName,
  variationId,
}: {
  storybook: string;
  libraryName: string;
  sliceName: string;
  variationId: string;
}) => {
  try {
    return new URL(
      `/?path=/story/${createStorybookPath({
        libraryName,
        sliceName,
        variationId,
      })}`,
      storybook
    ).toString();
  } catch (e) {
    return storybook;
  }
};
