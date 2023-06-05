import { sprinkles } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

export const container = style({ padding: "0 14px" });

export const icon = style([
  sprinkles({
    marginBottom: 32,
  }),
]);

export const flex = style([
  sprinkles({
    display: "flex",
    justifyContent: "space-between",
  }),
]);

export const title = {
  // TODO: sprinkles doesn't do fonts or colors and style is over ridden by some global selector (probably theme-ui), so this needs to go inline
  fontWeight: 500,
  fontSize: "18px",
  lineHeight: "32px",
  color: "#1A1523",
  margin: 0,
};

export const repoUrl = {
  // TODO: same as above
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "12px",
  lineHeight: "16px",
  color: "#6F6E77",
  margin: 0,
};
