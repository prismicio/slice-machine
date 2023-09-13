import { colors, sprinkles, vars } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

export const layout = {
  small: style([
    sprinkles({
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }),
  ]),
  normal: style([
    sprinkles({
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }),
  ]),
  large: style([
    sprinkles({
      display: "flex",
      flexDirection: "column",
      gap: 24,
    }),
  ]),
};

export const card = style([
  sprinkles({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    paddingRight: 16,
    backgroundColor: colors.grey2,
    borderColor: colors.grey6,
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
    overflowX: "hidden",
    cursor: "pointer",
  }),
  {
    selectors: {
      "&:hover, &:focus": {
        backgroundColor: vars.color.greyLight3,
      },
    },
  },
]);

export const cardDisable = style([
  sprinkles({
    opacity: "60%",
    cursor: "notAllowed",
  }),
]);

export const cardSelected = style([
  sprinkles({
    backgroundColor: colors.purple10,
  }),
  {
    selectors: {
      "&:hover, &:focus": {
        backgroundColor: vars.color.purple11,
      },
    },
  },
]);

export const padInline = style([
  sprinkles({
    paddingInline: 8,
  }),
]);

export const backButton = style([
  sprinkles({
    display: "inline-flex",
    gap: 4,
    alignItems: "center",
    color: colors.grey12,
    paddingInline: 8,
    paddingBlock: 4,
  }),
  {
    textDecoration: "none",
    alignSelf: "start",
    selectors: {
      "&:hover, &:focus": {
        borderRadius: vars.borderRadius["6"],
        backgroundColor: vars.color.greyLight3,
      },
    },
  },
]);
