import { FC } from "react";
import { colors, sprinkles } from "@prismicio/editor-ui";
import clsx from "clsx";

import * as styles from "./Divider.css";

type DividerProps = {
  color?: keyof typeof colors;
  variant?: "dashed" | "edgeFaded";
  className?: string;
};

export const Divider: FC<DividerProps> = (props) => {
  const { variant = "dashed", color = "currentColor", className } = props;

  return (
    <hr
      className={clsx(
        styles.variants[variant],
        sprinkles({ color: colors[color] }),
        className,
      )}
    />
  );
};
