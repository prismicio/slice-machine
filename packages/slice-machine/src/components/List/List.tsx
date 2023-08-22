import { ButtonGroup, Text } from "@prismicio/editor-ui";
import type { FC, PropsWithChildren, ReactNode } from "react";

import * as styles from "./List.css";

export const List: FC<PropsWithChildren> = (props) => (
  <article {...props} className={styles.root} />
);

type ListHeaderProps = PropsWithChildren<{
  actions?: ReactNode;
  toggle?: ReactNode;
}>;

export const ListHeader: FC<ListHeaderProps> = ({
  actions,
  children,
  toggle,
  ...otherProps
}) => (
  <header {...otherProps} className={styles.header}>
    <Text color="grey11" component="span" variant="smallBold">
      {children}
    </Text>
    {toggle}
    <ButtonGroup
      className={styles.headerActions}
      size="medium"
      variant="secondary"
    >
      {actions}
    </ButtonGroup>
  </header>
);
