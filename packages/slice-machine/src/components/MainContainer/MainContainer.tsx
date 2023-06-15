import { clsx } from "clsx";
import type { FC, PropsWithChildren } from "react";

import * as styles from "./MainContainer.css";

type MainContainerProps = PropsWithChildren<{
  className?: string;
}>;

export const MainContainer: FC<MainContainerProps> = ({
  children,
  className,
  ...otherProps
}) => (
  <div {...otherProps} className={clsx(styles.root, className)}>
    {children}
  </div>
);
