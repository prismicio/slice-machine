import { clsx } from "clsx";
import { forwardRef, MouseEventHandler } from "react";

import { Icon } from "../Icon/Icon";
import type { IconName } from "../Icon/iconNames";

import * as styles from "./IconButton.css";

type IconButtonProps = Readonly<{
  icon: IconName;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}>;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ icon, onClick, className, ...otherProps }, ref) {
    return (
      <button
        className={clsx(styles.root, className)}
        onClick={onClick}
        ref={ref}
        {...otherProps}
      >
        <Icon name={icon} />
      </button>
    );
  }
);
