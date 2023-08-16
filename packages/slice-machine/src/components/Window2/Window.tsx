import { Text } from "@prismicio/editor-ui";
import * as Tabs from "@radix-ui/react-tabs";
import type { CSSProperties, FC, PropsWithChildren } from "react";

import * as styles from "./Window.css";

type WindowProps = PropsWithChildren<{ style?: CSSProperties }>;

export const Window: FC<WindowProps> = (props) => (
  <div {...props} className={styles.root} />
);

export const WindowFrame: FC = (props) => (
  <div {...props} className={styles.frame}>
    <div className={styles.titleBarOptions}>
      <span className={styles.titleBarOption} />
      <span className={styles.titleBarOption} />
      <span className={styles.titleBarOption} />
    </div>
  </div>
);

type WindowTabsProps = Pick<
  Tabs.TabsProps,
  "children" | "defaultValue" | "onValueChange" | "value"
>;

export const WindowTabs: FC<WindowTabsProps> = (props) => (
  <Tabs.Root {...props} className={styles.tabs} />
);

export const WindowTabsList: FC<PropsWithChildren> = (props) => (
  <Tabs.List {...props} className={styles.tabsList} />
);

type WindowTabsTriggerProps = Pick<Tabs.TabsTriggerProps, "children" | "value">;

export const WindowTabsTrigger: FC<WindowTabsTriggerProps> = ({
  children,
  ...otherProps
}) => (
  <Tabs.Trigger {...otherProps} className={styles.tabsTrigger}>
    <Text
      className={styles.tabsTriggerText}
      color="inherit"
      component="span"
      noWrap
      variant="emphasized"
    >
      {children}
    </Text>
    <div
      style={{
        backgroundColor: "white",
        height: 32,
        minWidth: 32,
        position: "relative",
      }}
    />
  </Tabs.Trigger>
);

type WindowTabsContentProps = Pick<Tabs.TabsContentProps, "children" | "value">;

export const WindowTabsContent: FC<WindowTabsContentProps> = (props) => (
  <Tabs.Content {...props} className={styles.tabsContent} />
);
