import { colors, sprinkles, vars } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

const block = style([
  sprinkles({
    all: "unset",
    boxSizing: "border-box",
    fontFamily: "body",
  }),
]);

const blockWithDisplayRevert = style([
  block,
  sprinkles({
    display: "revert",
  }),
]);

export const root = style([
  blockWithDisplayRevert,
  {
    width: "288px",
  },
]);

export const title = style([
  block,
  sprinkles({
    alignItems: "center",
    borderBottomStyle: "solid",
    borderColor: colors.grey6,
    borderWidth: 1,
    color: colors.grey12,
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 4,
    paddingLeft: 16,
    paddingRight: 6,
    paddingTop: 4,
  }),
  {
    fontSize: "12px",
    fontWeight: "500",
    lineHeight: "16px",
  },
]);

export const titleCloseIcon = style([
  block,
  sprinkles({
    color: colors.grey11,
    display: "flex",
    padding: 4,
  }),
  {
    ":hover": { cursor: vars.cursor.pointer },
  },
]);

export const mediaContainer = style([
  block,
  sprinkles({
    display: "flex",
    marginBottom: 8,
    paddingInline: 16,
  }),
]);

export const media = style([
  blockWithDisplayRevert,
  sprinkles({
    borderColor: colors.grey6,
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
    width: "100%",
  }),
  {
    height: "146px",
  },
]);

export const description = style([
  blockWithDisplayRevert,
  sprinkles({
    color: colors.grey11,
    marginBottom: 16,
    paddingInline: 16,
  }),
  {
    fontSize: "12px",
    fontWeight: "400",
    lineHeight: "20px",
  },
]);

export const closeButtonContainer = style([
  blockWithDisplayRevert,
  sprinkles({
    paddingBottom: 16,
    paddingInline: 16,
  }),
]);

export const closeButton = style([
  blockWithDisplayRevert,
  sprinkles({
    boxShadow: 1,
    textAlign: "center",
    width: "100%",
  }),
]);
