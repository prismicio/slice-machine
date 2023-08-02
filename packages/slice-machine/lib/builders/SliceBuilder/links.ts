export function variation({
  lib,
  sliceName,
  variationId,
  options = {},
  isSimulator,
}: {
  lib: string;
  sliceName: string;
  variationId: string;
  options?: object;
  isSimulator?: boolean;
}): {
  href: string;
  as: string;
  options: object;
  all: [string, string, object];
} {
  const href = `/[lib]/[sliceName]/[variation]${
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    isSimulator ? "/simulator" : ""
  }`;
  const as = `/${lib}/${sliceName}/${variationId}${
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    isSimulator ? "/simulator" : ""
  }`;

  return {
    href,
    as,
    options,
    all: [href, as, options],
  };
}
