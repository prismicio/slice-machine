import { colors, sprinkles, vars } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

const block = style([
  sprinkles({
    boxSizing: "border-box",
    fontFamily: "body",
    // all: "unset", // can be applied out of oder :/
  }),
]);

export const videoContainer = style([
  block,
  sprinkles({
    backgroundColor: colors.grey1,
    borderRadius: 6,
  }),
  {
    width: "304px",
    height: "332px",
  },
]);

export const videoHeader = style([
  block,
  sprinkles({
    backgroundColor: colors.purple8,
    color: colors.purple12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 4,
    paddingLeft: 16,
  }),
  {
    lineHeight: "16px",
    fontSize: "12px",
    fontStyle: "normal",
    fontWeight: "600",
  },
]);

export const videoPlayer = style([
  sprinkles({
    width: "100%",
  }),
  {
    height: "auto",
  },
]);

export const videoFooter = style([
  block,
  sprinkles({
    padding: 16,
  }),
]);

export const videoDescription = style([
  block,
  sprinkles({
    color: colors.grey11,
    marginBottom: 16,
  }),
  {
    fontFamily: "SF Pro Text",
    fontSize: "12px",
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: "16px",
  },
]);

export const videoButton = style([
  block,
  sprinkles({
    textAlign: "center",
    backgroundColor: colors.grey1,
    borderRadius: 6,
    width: "100%",
    padding: 8,
  }),
  {
    boxShadow: vars.boxShadow[1],
  },
]);

export const closeButton = style([
  block,
  sprinkles({ color: colors.purple12 }),
  {
    background: "none",
    border: "none",
  },
]);
