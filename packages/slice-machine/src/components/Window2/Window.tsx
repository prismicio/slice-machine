import { Text } from "@prismicio/editor-ui";
import type { FC, PropsWithChildren } from "react";

import * as styles from "./Window.css";

export const Window: FC<PropsWithChildren> = (props) => (
  <div {...props} className={styles.root} />
);

export const WindowFrame: FC = (props) => (
  <div {...props} className={styles.frame} />
);

export const WindowTabs: FC<PropsWithChildren> = (props) => (
  <div {...props} className={styles.tabs} />
);

export const WindowTabsList: FC<PropsWithChildren> = (props) => (
  <div {...props} className={styles.tabsList} />
);

export const WindowTabsTrigger: FC<PropsWithChildren> = ({
  children,
  ...otherProps
}) => (
  <div {...otherProps} className={styles.tabsTrigger}>
    <Text
      className={styles.tabsTriggerText}
      component="span"
      variant="emphasized"
    >
      {children}
    </Text>
    <div style={{ backgroundColor: "white", height: "32px", width: "32px" }} />
  </div>
);

export const WindowTabsContent: FC<PropsWithChildren> = (props) => (
  <div {...props} className={styles.tabsContent} />
);
