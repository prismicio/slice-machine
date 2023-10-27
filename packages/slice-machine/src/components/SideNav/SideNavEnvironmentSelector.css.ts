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
    height: 32,
    marginBottom: 32,
    width: 32,
  }),
]);

const dotBase = sprinkles({
  width: 16,
  height: 16,
  flexShrink: 0,
});

export const dot = styleVariants({
  prod: [
    dotBase,
    sprinkles({
      color: colors.purple8,
    }),
  ],
  stage: [
    dotBase,
    sprinkles({
      color: colors.indigo10,
    }),
  ],
  dev: [
    dotBase,
    sprinkles({
      color: colors.amber10,
    }),
  ],
});
