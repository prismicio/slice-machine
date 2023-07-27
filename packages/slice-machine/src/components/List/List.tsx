import type { FC, PropsWithChildren } from "react";

import * as styles from "./List.css";

export const List: FC<PropsWithChildren> = (props) => (
  <div className={styles.root} {...props} />
);

export const ListHeader: FC<
  PropsWithChildren & { actions?: React.ReactNode }
> = ({ actions, children, ...props }) => (
  <div {...props} className={styles.header}>
    <span className={styles.headerLeftItem}>{children}</span>
    {actions}
  </div>
);
