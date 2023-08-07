import type { FC, PropsWithChildren } from "react";

import * as styles from "./List.css";
import { ButtonGroup, Text } from "@prismicio/editor-ui";

export const List: FC<PropsWithChildren> = (props) => (
  <div className={styles.root} {...props} />
);

export const ListHeader: FC<
  PropsWithChildren & { actions?: React.ReactNode }
> = ({ actions, children, ...props }) => (
  <div {...props} className={styles.header}>
    <Text color="grey11" component="span" noWrap variant="small">
      {children}
    </Text>
    <ButtonGroup size="medium" variant="secondary">
      {actions}
    </ButtonGroup>
  </div>
);
