import * as Tabs from "@radix-ui/react-tabs";
import { FC, ReactNode } from "react";
import { Text } from "@prismicio/editor-ui";

import * as styles from "./ContentTabs.css";

type ContentTabsProps = {
  tabs: Tab[];
};

type Tab = { label: string; content: ReactNode };

export const ContentTabs: FC<ContentTabsProps> = ({ tabs }) => (
  <Tabs.Root defaultValue={tabs[0].label} orientation="vertical">
    <Tabs.List className={styles.list} aria-label="content tabs">
      {tabs.map(({ label }, i) => {
        return (
          <Tabs.Trigger
            className={styles.trigger}
            key={`${label}-trig${i + 1}`}
            value={label}
          >
            <Text component="span" color="inherit">
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
          {content}
        </Tabs.Content>
      );
    })}
  </Tabs.Root>
);
