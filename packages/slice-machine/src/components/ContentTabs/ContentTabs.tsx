import * as Tabs from "@radix-ui/react-tabs";
import type { CSSProperties, FC, ReactNode } from "react";
import { ScrollArea, Text } from "@prismicio/editor-ui";

import * as styles from "./ContentTabs.css";

type ContentTabsProps = {
  style?: CSSProperties;
  tabs: Tab[];
};

type Tab = { label: string; content: ReactNode };

export const ContentTabs: FC<ContentTabsProps> = ({ tabs, ...otherProps }) => (
  <Tabs.Root
    {...otherProps}
    className={styles.root}
    defaultValue={tabs[0].label}
    orientation="vertical"
  >
    <Tabs.List className={styles.list} aria-label="content tabs">
      {tabs.map(({ label }, i) => {
        return (
          <Tabs.Trigger
            className={styles.trigger}
            key={`${label}-trig${i + 1}`}
            value={label}
          >
            <Text
              className={styles.triggerText}
              component="span"
              color="inherit"
            >
              {label}
            </Text>
          </Tabs.Trigger>
        );
      })}
    </Tabs.List>
    {tabs.map(({ label, content }, i) => {
      return (
        <Tabs.Content
          className={styles.content}
          key={`${label}-content${i + 1}`}
          value={label}
        >
          <ScrollArea className={styles.scrollArea}>{content}</ScrollArea>
        </Tabs.Content>
      );
    })}
  </Tabs.Root>
);
