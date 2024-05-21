import { Text } from "@prismicio/editor-ui";
import type { CSSProperties, FC, PropsWithChildren, ReactNode } from "react";
import clsx from "clsx";

import styles from "./List.module.css";

type ListProps = PropsWithChildren<{
  inset?: boolean;
  style?: CSSProperties;
}>;

export const List: FC<ListProps> = (props) => {
  const { inset = false, ...otherProps } = props;

  return (
    <div
      {...otherProps}
      className={clsx(styles.root, inset && styles["root-inset"])}
    />
  );
};

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
