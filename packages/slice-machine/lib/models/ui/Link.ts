export const Link = {
  variation(
    lib: string,
    sliceName: string,
    variationId: string,
    options: object = {}
  ): {
    href: string;
    as: string;
    options: object;
    all: [string, string, object];
  } {
    const href = "/[lib]/[sliceName]/[variation]";
    const as = `/${lib}/${sliceName}/${variationId}`;

    return {
      href,
      as,
      options,
      all: [href, as, options],
    };
  },
};
