import { colors, sprinkles, vars, selectors, mode } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

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

const interactiveElement = style([
  sprinkles({
    transitionDuration: 200,
    transitionTimingFunction: "easeOut",
  }),
  {
    transitionProperty:
      "background-color, border-color, boxShadow, fill, color",
  },
]);

export const root = style([
  block,
  sprinkles({
    backgroundColor: colors.grey2,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    paddingInline: 32,
    paddingTop: 16,
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

export const repository = style([
  block,
  sprinkles({
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 32,
  }),
]);

export const repositoryInfo = style([sprinkles({ minWidth: 0 }), { flex: 1 }]);

export const repositoryName = style([
  blockWithDisplayRevert,
  sprinkles({
    color: colors.grey12,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  {
    fontWeight: 500,
    fontSize: "18px",
    lineHeight: "32px",
  },
]);

export const repositoryDomain = style([
  blockWithDisplayRevert,
  sprinkles({
    color: colors.grey11,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  {
    fontSize: "12px",
    lineHeight: "16px",
  },
]);

export const repositoryLinkIcon = style([
  block,
  interactiveElement,
  sprinkles({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
    cursor: "pointer",
    height: 32,
    marginRight: 8,
    width: 32,
    color: colors.grey12,
    backgroundColor: {
      ...colors.grey2,
      ...selectors.hover(colors.grey4),
      ...selectors.focusVisible(colors.grey2),
    },
    borderColor: {
      ...colors.transparent,
      ...selectors.hover(colors.grey7),
      ...selectors.focusVisible(colors.purple8),
    },
  }),
  {
    ":focus": {
      borderColor: vars.color.purple8,
      boxShadow: vars.boxShadow.focus,
    },
  },
]);

export const list = style([
  blockWithDisplayRevert,
  { listStyleType: "none", ":last-child": { marginBottom: vars.space[32] } },
]);

export const listBottom = style([
  sprinkles({
    paddingTop: 48,
  }),
  {
    marginTop: "auto",
  },
]);

export const listItem = style([
  blockWithDisplayRevert,
  sprinkles({
    marginTop: 8,
  }),
  {
    ":first-child": {
      marginTop: 0,
    },
  },
]);

export const listTitle = style([
  blockWithDisplayRevert,
  sprinkles({
    color: colors.grey11,
    marginBottom: 8,
    marginTop: 16,
  }),
  {
    fontSize: "12px",
    fontWeight: 600,
    lineHeight: "16px",
  },
]);

export const dashedLine = style([
  blockWithDisplayRevert,
  sprinkles({
    borderColor: colors.grey6,
    borderTopStyle: "dashed",
    borderWidth: 1,
    marginTop: 8,
  }),
]);

export const link = style([
  block,
  interactiveElement,
  sprinkles({
    alignItems: "center",
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
    cursor: "pointer",
    display: "flex",
    gap: 8,
    padding: 8,
    paddingRight: 16,
  }),
  {
    fontSize: "14px",
    height: "48px",
    lineHeight: "24px",
    ":focus": {
      boxShadow: vars.boxShadow.focus,
    },
    selectors: {
      // Not Active & Default
      "&:not([data-active=true])": {
        borderColor: vars.color.transparent,
        backgroundColor: vars.color.greyLight2,
        color: vars.color.greyLight12,
      },
      // Not Active & Hover
      "&:not([data-active=true]):hover": {
        borderColor: vars.color.greyLight7,
        backgroundColor: vars.color.greyLight4,
      },
      // Not Active & Focus
      "&:not([data-active=true]):focus": {
        borderColor: vars.color.purple8,
      },
      // Active & Default
      "&[data-active=true]": {
        backgroundColor: vars.color.purple12,
        borderColor: vars.color.purple8,
        color: vars.color.purple8,
      },
      // Active & Hover
      "&[data-active=true]:hover": {
        backgroundColor: vars.color.greyLight1,
      },
      // Parent list item is open
      '[data-state="open"] > &, [data-state="open"] > &:hover': {
        borderColor: vars.color.purple8,
        boxShadow: vars.boxShadow.focus,
      },
    },
  },
]);

export const linkIcon = style([
  blockWithDisplayRevert,
  {
    selectors: {
      // Not Active
      [`${link}:not([data-active=true]) &`]: {
        fill: vars.color.greyLight11,
      },
      // Active
      [`${link}[data-active=true] &`]: {
        fill: vars.color.purple8,
      },
    },
  },
]);

export const linkContent = style([
  block,
  sprinkles({
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  }),
]);

export const linkText = style([
  blockWithDisplayRevert,
  {
    alignSelf: "baseline",
  },
]);

export const rightElementPill = style([
  block,
  sprinkles({
    alignItems: "center",
    borderStyle: "solid",
    borderWidth: 1,
    display: "flex",
    height: 20,
    justifyContent: "center",
    minWidth: 20,
    paddingBlock: 0,
    paddingInline: 4,
  }),
  {
    alignSelf: "center",
    borderRadius: "32px",
    fontSize: "12px",
    fontWeight: 500,
    lineHeight: "16px",
    selectors: {
      // Not Active
      [`${link}:not([data-active=true]) &`]: {
        backgroundColor: vars.color.purple9,
        borderColor: vars.color.purple8,
        color: vars.color.purple12,
      },
      // Active
      [`${link}[data-active=true] &`]: {
        borderColor: "transparent",
        color: vars.color.greyLight11,
      },
    },
  },
]);

export const rightElementText = style([
  blockWithDisplayRevert,
  sprinkles({
    color: colors.grey11,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  {
    alignSelf: "baseline",
    fontSize: "12px",
    lineHeight: "16px",
    maxWidth: "82px",
  },
]);

export const updateInfo = style([
  blockWithDisplayRevert,
  sprinkles({
    backgroundColor: colors.grey3,
    borderRadius: 6,
    marginTop: 32,
    padding: 16,
  }),
]);

export const updateInfoTitle = style([
  blockWithDisplayRevert,
  sprinkles({
    color: colors.grey12,
  }),
  {
    fontSize: "12px",
    fontWeight: 600,
    lineHeight: "20px",
  },
]);

export const updateInfoText = style([
  blockWithDisplayRevert,
  sprinkles({
    color: colors.grey11,
  }),
  {
    fontSize: "12px",
    lineHeight: "20px",
  },
]);

export const updateInfoLink = style([
  block,
  interactiveElement,
  sprinkles({
    alignItems: "center",
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
    color: colors.grey12,
    cursor: "pointer",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    paddingBlock: 4,
    paddingInline: 16,
    width: "100%",
    backgroundColor: {
      ...colors.grey1,
      ...selectors.hover(colors.grey3),
    },
    borderColor: colors.grey6,
  }),
  {
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "24px",
    ":focus": {
      borderColor: vars.color.purple8,
      boxShadow: vars.boxShadow.focus,
    },
    selectors: {
      [`${mode.light} &:hover`]: {
        borderColor: vars.color.greyLight7,
      },
      [`${mode.dark} &:hover`]: {
        borderColor: vars.color.greyDark7,
      },
    },
  },
]);
