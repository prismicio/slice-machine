import { clsx } from "clsx";
import { forwardRef } from "react";

import { Icon } from "@prismicio/editor-ui";
import { ProgressCircle } from "@prismicio/editor-ui";

import type { IconName } from "@prismicio/editor-ui/dist/components/Icon";
import * as styles from "./IconButton.css";

export interface IconButtonProps {
  icon: IconName;
  size?: keyof typeof styles.size;
  loading?: boolean;
  onClick?: () => void;
  variant?: keyof typeof styles.variant;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icon,
      loading = false,
      size = "medium",
      variant = "primary",
      ...otherProps
    },
    ref
  ) {
    return (
      <button
        {...otherProps}
        className={clsx(
          styles.root,
          styles.size[size],
          styles.variant[variant]
        )}
        disabled={loading}
        ref={ref}
      >
        {loading ? (
          <ProgressCircle />
        ) : (
          <Icon name={icon} color="grey11" size={size} />
        )}
      </button>
    );
  }
);
