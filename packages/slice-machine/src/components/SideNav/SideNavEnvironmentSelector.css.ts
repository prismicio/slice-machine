import { colors, sprinkles } from "@prismicio/editor-ui";
import { style, styleVariants } from "@vanilla-extract/css";

export const logo = style([
  sprinkles({
    height: 40,
    width: 40,
  }),
  {
    display: "block",
  },
]);

const environmentDotBase = style([
  sprinkles({
    flexShrink: 0,
    borderRadius: "50%",
  }),
  {
    width: 10,
    height: 10,
  },
]);

export const environmentDot = styleVariants({
  prod: [environmentDotBase, sprinkles({ backgroundColor: colors.purple10 })],
  stage: [environmentDotBase, sprinkles({ backgroundColor: colors.indigo10 })],
  dev: [environmentDotBase, sprinkles({ backgroundColor: colors.amber10 })],
});

export const menuItemEnvironmentDot = sprinkles({
  marginRight: 2,
  marginLeft: 2,
});

export const activeEnvironmentDot = style([
  sprinkles({
    position: "absolute",
    bottom: 0,
    right: 0,
    outlineWidth: 3,
    outlineColor: colors.grey2,
    outlineStyle: "solid",
  }),
  {
    transform: "translate(50%, 50%)",
  },
]);

export const activeEnvironmentName = style([
  sprinkles({
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  {
    fontWeight: 500,
    lineHeight: "1.25rem",
  },
]);

export const loginIcon = sprinkles({
  width: 24,
  height: 24,
});
