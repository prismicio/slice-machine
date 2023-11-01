import { colors, sprinkles } from "@prismicio/editor-ui";
import { style, styleVariants } from "@vanilla-extract/css";

// TODO: watch this PR https://github.com/vanilla-extract-css/vanilla-extract/pull/1105
const block = style([
  sprinkles({
    boxSizing: "border-box",
    fontFamily: "body",
    all: "unset",
  }),
]);

const blockWithDisplayRevert = style([
  block,
  sprinkles({
    display: "revert",
  }),
]);

export const logo = style([
  blockWithDisplayRevert,
  sprinkles({
    height: 40,
    width: 40,
  }),
]);

const environmentDotBase = style([
  sprinkles({
    flexShrink: 0,
    borderRadius: "50%",
    backgroundColor: colors.currentColor,
  }),
  {
    width: 10,
    height: 10,
  },
]);

export const environmentDot = styleVariants({
  prod: [environmentDotBase, sprinkles({ color: colors.purple8 })],
  stage: [environmentDotBase, sprinkles({ color: colors.indigo10 })],
  dev: [environmentDotBase, sprinkles({ color: colors.amber10 })],
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
  {
    fontWeight: 500,
  },
]);
