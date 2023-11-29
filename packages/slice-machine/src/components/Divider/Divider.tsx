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
      style={
        // Vanilla Extract does not compile the necessary `linear-gradient`
        // correctly in production; the `0%` used in the style is "minified" to
        // 0, which is invalid.
        // TODO: Move these styles out of the `style` prop when Vanilla Extract
        // is replaced.
        variant === "edgeFaded"
          ? {
              backgroundImage:
                "linear-gradient(to right, color-mix(in srgb, currentColor 0%, transparent), currentColor, color-mix(in srgb, currentColor 0%, transparent))",
            }
          : undefined
      }
    />
  );
};
