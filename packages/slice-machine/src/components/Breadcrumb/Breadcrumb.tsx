import { Text } from "@prismicio/editor-ui";
import { FC, ReactNode } from "react";

import * as styles from "./Breadcrumb.css";

type BreadcrumbProps = Readonly<{
  children: ReactNode;
}>;

export const Breadcrumb: FC<BreadcrumbProps> = ({ children }) => {
  return <Text className={styles.root}>{children}</Text>;
};
