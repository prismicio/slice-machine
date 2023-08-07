import type { FC, PropsWithChildren } from "react";

import * as styles from "./List.css";
import { ButtonGroup } from "@prismicio/editor-ui";

export const List: FC<PropsWithChildren> = (props) => (
  <div className={styles.root} {...props} />
);

export const ListHeader: FC<
  PropsWithChildren & { actions?: React.ReactNode }
> = ({ actions, children, ...props }) => (
  <div {...props} className={styles.header}>
    <span className={styles.headerLeftItem}>{children}</span>
    <ButtonGroup variant="secondary">{actions}</ButtonGroup>
  </div>
);
