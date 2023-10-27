import { style } from "@vanilla-extract/css";

export const label = style({
  marginTop: 8,
  marginBottom: 8,
  selectors: {
    "&:first-child": {
      marginTop: 0,
    },
    "&:last-child": {
      marginBottom: 0,
    },
  },
});
