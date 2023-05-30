import { clsx } from "clsx";
import type { FC, PropsWithChildren } from "react";
import { Text } from "@prismicio/editor-ui";

import * as styles from "./PageLayout.css";

type PageLayoutProps = PropsWithChildren<{
  className?: string;
}>;

export const PageLayout: FC<PageLayoutProps> = ({
  children,
  className,
  ...otherProps
}) => (
  <div {...otherProps} className={clsx(styles.root, className)}>
    <Text>PageLayout</Text>
    {children}
  </div>
);
