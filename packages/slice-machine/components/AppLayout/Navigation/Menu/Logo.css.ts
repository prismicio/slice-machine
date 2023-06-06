import { style } from "@vanilla-extract/css";

export const container = style({ padding: "0 14px" });

export const icon = style({
  marginBottom: 32,
});

export const flex = style({
  display: "flex",
  justifyContent: "space-between",
});

export const title = style({
  fontWeight: 500,
  fontSize: "18px",
  lineHeight: "32px",
  color: "#1A1523",
  margin: 0,
});

export const repoUrl = style({
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "12px",
  lineHeight: "16px",
  color: "#6F6E77",
  margin: 0,
});
