import { theme } from "@prismicio/editor-ui";
import { clsx } from "clsx";
import type { FC } from "react";

import styles from "./Divider.module.css";

type DividerProps = {
  color?: keyof typeof theme.color;
  variant?: "dashed" | "edgeFaded";
  className?: string;
};

export const Divider: FC<DividerProps> = (props) => {
  const { variant = "dashed", color = "currentColor", className } = props;

  return (
    <hr
      className={clsx(styles[`variant-${variant}`], className)}
      style={{ color: theme.color[color] }}
    />
  );
};
