import type { FC, PropsWithChildren } from "react";

import * as styles from "./PageLayout.css";

type PageLayoutProps = PropsWithChildren<{
  environmentKind?: "prod" | "stage" | "dev";
}>;

export const PageLayout: FC<PageLayoutProps> = ({
  environmentKind,
  children,
  ...otherProps
}) => (
  <div {...otherProps} className={styles.root}>
    {children}
    <div
      className={
        environmentKind ? styles.borderTop[environmentKind] : undefined
      }
    />
  </div>
);

export const PageLayoutPane: FC<PropsWithChildren> = (props) => (
  <div {...props} className={styles.pane} />
);

export const PageLayoutHeader: FC<PropsWithChildren> = (props) => (
  <header {...props} className={styles.header} />
);

export const PageLayoutContent: FC<PropsWithChildren> = ({
  children,
  ...otherProps
}) => (
  <main {...otherProps} className={styles.content}>
    <div className={styles.contentChildren}>{children}</div>
  </main>
);
