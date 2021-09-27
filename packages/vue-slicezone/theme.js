const validateThemeProps = (themeProps, args) => {
  const type = typeof themeProps;
  if (type !== "object") {
    console.error('[slicezone] prop "theme" is not valid.');
    console.log(
      `Expected type to be object, received ${type} ${
        args.slice ? `at slice "${args.slice.slice_type}"` : ""
      } (pos. ${args.i})`
    );
  }
  return themeProps;
};

export const caller = (themeProps, args) =>
  Object.entries(themeProps).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: typeof value === "function" ? value(args) : value,
    }),
    {}
  );

export const formatThemeProps = (theme, args = {}) => {
  const themeProps = (() => {
    if (typeof theme === "function") {
      return theme(args);
    }
    const { sliceName } = args;
    if (sliceName && theme[sliceName]) {
      return typeof theme[sliceName] === "function"
        ? theme[sliceName](args)
        : theme[sliceName];
    }
    return theme;
  })();

  return caller(validateThemeProps(themeProps, args), args);
};
