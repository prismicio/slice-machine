import { Text } from "@prismicio/editor-ui";
import type { FC, PropsWithChildren, ReactNode } from "react";

import styles from "./FieldSet.module.css";

export const FieldSet: FC<PropsWithChildren> = (props) => (
  <div {...props} className={styles.root} />
);

export const FieldSetLegend: FC<PropsWithChildren> = ({
  children,
  ...otherProps
}) => (
  <div {...otherProps} className={styles.legend}>
    <Text color="grey11" component="span" noWrap variant="smallBold">
      {children}
    </Text>
  </div>
);

export const FieldSetHeader: FC<PropsWithChildren> = (props) => (
  <div {...props} className={styles.header} />
);

export const FieldSetContent: FC<PropsWithChildren> = (props) => (
  <div {...props} className={styles.content} />
);

export const FieldSetList: FC<PropsWithChildren> = (props) => (
  <ul {...props} className={styles.list} />
);

type FieldSetListItemProps = PropsWithChildren<{ action?: ReactNode }>;

export const FieldSetListItem: FC<FieldSetListItemProps> = ({
  action,
  children,
  ...otherProps
}) => (
  <li {...otherProps} className={styles.listItem}>
    <Text
      className={styles.listItemText}
      component="span"
      noWrap
      variant="bold"
    >
      {children}
    </Text>
    {action}
  </li>
);

type FieldSetFooterProps = PropsWithChildren<{ action?: ReactNode }>;

export const FieldSetFooter: FC<FieldSetFooterProps> = ({
  action,
  children,
  ...otherProps
}) => (
  <div {...otherProps} className={styles.footer}>
    <Text
      className={styles.footerText}
      color="grey11"
      component="span"
      noWrap
      variant="small"
    >
      {children}
    </Text>
    {action}
  </div>
);
