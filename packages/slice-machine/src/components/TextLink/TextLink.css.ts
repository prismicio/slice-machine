import { style, styleVariants } from "@vanilla-extract/css";

import { colors, selectors, sprinkles } from "@prismicio/editor-ui";

export const root = style([
  sprinkles({
    all: "unset",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: {
      ...colors.indigo11,
      ...selectors.hover(colors.indigo10),
      ...selectors.active(colors.indigo11),
    },
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
});

export const text = style([
  sprinkles({
    display: "flex",
    alignItems: "center",
  }),
]);

export const endIcon = style([
  sprinkles({
    paddingLeft: 4,
  }),
]);

export const iconVariant = styleVariants({
  normal: [
    {
      fontSize: "1.2rem",
    },
  ],
  bold: [
    {
      fontSize: "1.4rem",
    },
  ],
  small: [
    {
      fontSize: "1rem",
    },
  ],
  smallBold: [
    {
      fontSize: "1rem",
    },
  ],
  extraSmall: [
    {
      fontSize: ".9rem",
    },
  ],
  emphasized: [
    {
      fontSize: "1rem",
    },
  ],
  h1: [
    {
      fontSize: "2rem",
    },
  ],
  h2: [
    {
      fontSize: "1.8rem",
    },
  ],
  h3: [
    {
      fontSize: "1.6rem",
    },
  ],
  h4: [
    {
      fontSize: "1.4rem",
    },
  ],
  inherit: [
    sprinkles({ fontFamily: "inherit" }),
    {
      fontSize: "inherit",
    },
  ],
});
