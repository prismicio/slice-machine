import { colors, selectors, sprinkles, vars } from "@prismicio/editor-ui";
import { style, styleVariants } from "@vanilla-extract/css";
import { calc } from "@vanilla-extract/css-utils";

const flex = sprinkles({ all: "unset", display: "flex" });

const column = style([flex, sprinkles({ flexDirection: "column" })]);

export const root = style([
  column,
  sprinkles({
    borderColor: colors.grey6,
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
    boxSizing: "border-box",
    overflowX: "hidden",
    position: "relative",
  }),
]);

export const size = styleVariants({
  small: { height: "240px" },
  medium: { height: "320px" },
});

export const variant = styleVariants({
  solid: [
    sprinkles({
      backgroundColor: colors.grey3,
      borderColor: selectors.checked(colors.purple10),
    }),
  ],
  outlined: [
    sprinkles({
      backgroundColor: colors.grey2,
      borderColor: selectors.checked(colors.purple8),
    }),
  ],
});

export const interactive = style({
  ":focus-visible": { boxShadow: "0px 0px 0px 4px hsla(251, 63%, 63%, 0.1)" },
  selectors: {
    "&[data-disabled]": { opacity: vars.opacity["50%"] },
    "&:not([data-disabled])": { cursor: vars.cursor.pointer },
  },
});

export const interactiveVariant = {
  solid: sprinkles({
    backgroundColor: selectors.focusVisible(colors.grey5),
    borderColor: selectors.focusVisible(colors.purple10),
  }),
  outlined: sprinkles({
    backgroundColor: {
      ...selectors.active(colors.grey4),
      ...selectors.focusVisible(colors.grey1),
      ...selectors.hover(colors.grey4),
    },
    borderColor: {
      ...selectors.active(colors.purple9),
      ...selectors.focusVisible(colors.purple8),
    },
  }),
};

export const media = style([
  column,
  sprinkles({ flexBasis: 0, flexGrow: 1, minHeight: 0, position: "relative" }),
  {
    order: 0,
    selectors: {
      [`${variant.solid} > &`]: {
        padding: calc.subtract(vars.space[32], vars.borderWidth[1]),
      },
      [`${variant.outlined} > &`]: {
        backgroundColor: vars.color.greyLight3,
        marginInline: calc.subtract(vars.space[16], vars.borderWidth[1]),
        marginTop: calc.subtract(vars.space[16], vars.borderWidth[1]),
        padding: vars.space[16],
      },
    },
  },
]);

const grid = sprinkles({ all: "unset", display: "grid" });

export const mediaComponent = styleVariants({
  div: [grid, sprinkles({ flexGrow: 1 })],
  img: [
    sprinkles({ height: "100%", objectFit: "contain" }),
    { selectors: { "&:not([src])": { visibility: "hidden" } } },
  ],
});

export const mediaOverlay = style([
  grid,
  sprinkles({ inset: 0, position: "absolute", visibility: "hidden" }),
  {
    "::before": {
      backgroundColor: vars.color.greyLight12,
      content: "",
      inset: vars.space[0],
      opacity: vars.opacity["10%"],
      position: "absolute",
    },
    selectors: {
      [`${interactive}:focus-visible &, ${interactive}:not([data-disabled]) ${media}:hover > &`]:
        { visibility: "visible" },
      [`${interactive}:not([data-disabled]) &:has(:focus-visible)`]: {
        visibility: "visible",
      },
    },
  },
]);

const nonMedia = style([
  flex,
  sprinkles({
    alignItems: "center",
    boxSizing: "border-box",
    flexDirection: "row",
  }),
  {
    selectors: {
      [`${variant.solid} > &`]: { backgroundColor: vars.color.greyLight1 },
      [`${variant.solid} > &:not(:first-child)`]: {
        borderTopColor: vars.color.greyLight6,
        borderTopStyle: "inherit",
        borderTopWidth: "inherit",
      },
    },
  },
]);

export const actions = style([
  nonMedia,
  sprinkles({ height: 48, justifyContent: "space-between" }),
  {
    order: 1,
    selectors: {
      [`${variant.solid} > &`]: {
        paddingLeft: calc.subtract(vars.space[12], vars.borderWidth[1]),
        paddingRight: calc.subtract(vars.space[8], vars.borderWidth[1]),
      },
      [`${variant.outlined} > &`]: {
        paddingInline: calc.subtract(vars.space[16], vars.borderWidth[1]),
      },
    },
  },
]);

export const footer = style([
  nonMedia,
  sprinkles({ gap: 8, height: 60 }),
  {
    order: 2,
    selectors: {
      [`${variant.solid} > &`]: {
        paddingInline: calc.subtract(vars.space[12], vars.borderWidth[1]),
      },
      [`${variant.outlined} > &`]: {
        paddingInline: calc.subtract(vars.space[16], vars.borderWidth[1]),
      },
    },
  },
]);

export const footerTexts = style([
  column,
  sprinkles({ flexBasis: 0, flexGrow: 1, minWidth: 0 }),
  // Offset `title` and `subtitle` so that they are centered vertically despite
  // having different line heights.
  { marginBottom: `calc((${24 / 16}rem - ${16 / 16}rem) / 2)` },
]);

export const status = style([
  column,
  sprinkles({
    height: 24,
    insetInline: 0,
    justifyContent: "center",
    paddingInline: 8,
    position: "absolute",
  }),
  { backgroundColor: "hsl(251, 91%, 95%)", color: "hsl(250, 43%, 48%)" },
]);
