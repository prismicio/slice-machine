export function variation({
  lib,
  sliceName,
  variationId,
  options = {},
  isPreview,
}: {
  lib: string;
  sliceName: string;
  variationId: string;
  options?: object;
  isPreview?: boolean;
}): {
  href: string;
  as: string;
  options: object;
  all: [string, string, object];
} {
  const href = `/[lib]/[sliceName]/[variation]${isPreview ? "/simulator" : ""}`;
  const as = `/${lib}/${sliceName}/${variationId}${
    isPreview ? "/simulator" : ""
  }`;

  return {
    href,
    as,
    options,
    all: [href, as, options],
  };
}
