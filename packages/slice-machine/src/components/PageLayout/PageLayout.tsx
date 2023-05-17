import type { FC, ReactNode } from "react";
import { Text } from "@prismicio/editor-ui";

import * as styles from "./PageLayout.css";

type PageLayoutProps = Readonly<{
  children?: ReactNode;
}>;

export const PageLayout: FC<PageLayoutProps> = ({
  children,
  ...otherProps
}) => (
  <div {...otherProps} className={styles.root}>
    <Text>PageLayout</Text>
    {children}
  </div>
);
