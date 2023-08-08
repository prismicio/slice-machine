import type { FC, PropsWithChildren, ReactNode } from "react";

import * as styles from "./List.css";
import { ButtonGroup, Text } from "@prismicio/editor-ui";

export const List: FC<PropsWithChildren> = (props) => (
  <article className={styles.root} {...props} />
);

export const ListHeader: FC<PropsWithChildren<{ actions?: ReactNode }>> = ({
  actions,
  children,
  ...props
}) => (
  <header {...props} className={styles.header}>
    <Text color="grey11" component="span" noWrap variant="small">
      {children}
    </Text>
    <ButtonGroup size="medium" variant="secondary">
      {actions}
    </ButtonGroup>
  </header>
);
