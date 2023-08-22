import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  IconButton,
  Text,
} from "@prismicio/editor-ui";
import * as Tabs from "@radix-ui/react-tabs";
import type { CSSProperties, FC, PropsWithChildren, ReactNode } from "react";

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
  <Tabs.Root {...props} activationMode="manual" className={styles.tabs} />
);

type WindowTabsListProps = PropsWithChildren<{ onAddNewTab?: () => void }>;

export const WindowTabsList: FC<WindowTabsListProps> = ({
  children,
  onAddNewTab,
  ...otherProps
}) => (
  <Tabs.List {...otherProps} className={styles.tabsList}>
    {children}
    <div className={styles.newTabButton}>
      <IconButton icon="add" onClick={onAddNewTab} />
    </div>
  </Tabs.List>
);

type WindowTabsTriggerProps = Pick<
  Tabs.TabsTriggerProps,
  "children" | "value"
> & { menu?: ReactNode };

export const WindowTabsTrigger: FC<WindowTabsTriggerProps> = ({
  children,
  menu,
  ...otherProps
}) => (
  <Tabs.Trigger
    {...otherProps}
    asChild
    onMouseDown={(event) => {
      let target = event.target as HTMLElement | null;
      while (target !== null && target !== event.currentTarget) {
        if (target.tabIndex >= 0) event.preventDefault();
        target = target.parentElement;
      }
      if (target === event.currentTarget) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }}
  >
    <div className={styles.tabsTrigger}>
      <Text
        className={styles.tabsTriggerText}
        color="inherit"
        component="span"
        noWrap
        variant="emphasized"
      >
        {children}
      </Text>
      {Boolean(menu) ? (
        <div className={styles.tabsTriggerMenu}>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <IconButton icon="moreVert" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">{menu}</DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : undefined}
    </div>
  </Tabs.Trigger>
);

type WindowTabsContentProps = Pick<Tabs.TabsContentProps, "children" | "value">;

export const WindowTabsContent: FC<WindowTabsContentProps> = (props) => (
  <Tabs.Content {...props} className={styles.tabsContent} />
);
