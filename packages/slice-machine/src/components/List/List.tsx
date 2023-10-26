import { Text } from "@prismicio/editor-ui";
import type { CSSProperties, FC, PropsWithChildren, ReactNode } from "react";

import * as styles from "./List.css";

type ListProps = PropsWithChildren<{
  style?: CSSProperties;
}>;

export const List: FC<ListProps> = (props) => (
  <div {...props} className={styles.root} />
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
  <div {...otherProps} className={styles.header}>
    <Text color="grey11" component="span" noWrap variant="bold">
      {children}
    </Text>
    {toggle}
    {Boolean(actions) ? (
      <div className={styles.headerActions}>{actions}</div>
    ) : null}
  </div>
);

export const ListItem: FC = (props) => (
  <div {...props} className={styles.item} />
);
