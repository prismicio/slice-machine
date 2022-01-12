import { createStorybookId } from "@lib/utils/str";

function camelCaseToDash(v: any): string {
  let ret = "",
    prevLowercase = false,
    prevIsNumber = false,
    isFirstChar = true;

  for (const s of v) {
    const isUppercase = s.toUpperCase() === s;
    const isNumber = !isNaN(s);

    if (isNumber && !prevIsNumber && !isFirstChar) {
      ret += "-";
    } else {
      if (isUppercase && !isNumber && (prevLowercase || prevIsNumber)) {
        ret += "-";
      }
    }
    ret += s;
    prevLowercase = !isUppercase;
    prevIsNumber = isNumber;
    isFirstChar = false;
  }
  return ret.replace(/-+/g, "-").toLowerCase();
}

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
