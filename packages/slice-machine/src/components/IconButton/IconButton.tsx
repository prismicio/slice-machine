import { clsx } from "clsx";
import { ReactElement, ReactSVG, forwardRef } from "react";
import { ThemeColor } from "@prismicio/editor-ui/dist/theme/colors";
import * as styles from "./IconButton.css";

export interface IconButtonProps {
  size?: keyof typeof styles.size;
  cursor?: keyof typeof styles.cursor;
  hasPadding?: boolean;
  color?: ThemeColor;
  loading?: boolean;
  onClick?: () => void;
  children: ReactElement<ReactSVG>;
}
/**
 * Same as the editors IconButton but has children and has no loading state
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      cursor = "pointer",
      loading = false,
      hasPadding = true,
      size = "medium",
      children,
      ...otherProps
    },
    ref
  ) {
    const isDisabled = loading;

    return (
      <button
        {...otherProps}
        className={clsx(
          styles.root,
          hasPadding ? styles.size[size] : styles.noPaddingSize[size],
          styles.cursor[isDisabled ? "default" : cursor]
        )}
        disabled={isDisabled}
        ref={ref}
      >
        {children}
      </button>
    );
  }
);
