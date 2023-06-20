import { style, styleVariants } from "@vanilla-extract/css";

import { colors, selectors, sprinkles } from "@prismicio/editor-ui";

export const root = style([
  sprinkles({
    all: "unset",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  }),
  {
    ":focus-visible": {
      outline: "none",
      textDecorationLine: "underline",
    },
  },
]);

export const colorVariant = styleVariants({
  primary: [
    sprinkles({
      color: {
        ...colors.purple9,
        ...selectors.hover(colors.purple8),
        ...selectors.active(colors.purple9),
      },
    }),
  ],
  secondary: [
    sprinkles({
      color: {
        ...colors.indigo11,
        ...selectors.hover(colors.indigo10),
        ...selectors.active(colors.indigo11),
      },
    }),
  ],
});

export const text = sprinkles({
  display: "flex",
  alignItems: "center",
});

/* TODO move paddingLeft to iconVariant style objects */
export const endIcon = style([
  sprinkles({
    paddingLeft: 4,
  }),
]);

export const iconVariant = styleVariants({
  normal: [
    {
      fontSize: "1.2rem",
      width: "18px",
      height: "18px",
    },
  ],
  smallBold: [
    {
      fontSize: "1rem",
      width: "16px",
      height: "16px",
    },
  ],
  inherit: [
    sprinkles({ fontFamily: "inherit" }),
    {
      fontSize: "inherit",
      width: "inherit",
      height: "inherit",
    },
  ],
});
