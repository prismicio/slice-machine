export const iconNames = [
  "reusable",
  "unique",
  "kebabDots",
  "fieldList",
] as const;

export type IconName = (typeof iconNames)[number];
