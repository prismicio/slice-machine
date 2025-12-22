import { Box, Tab } from "@prismicio/editor-ui";
import { ReactNode } from "react";

interface DialogTabsProps {
  selectedTab: "local" | "library";
  onSelectTab: (tab: "local" | "library") => void;
  rightContent?: ReactNode;
}

export function DialogTabs(props: DialogTabsProps) {
  const { selectedTab, onSelectTab, rightContent } = props;

  return (
    <Box justifyContent="space-between" padding={16} border={{ bottom: true }}>
      <Box gap={8}>
        <Tab
          selected={selectedTab === "local"}
          onClick={() => onSelectTab("local")}
        >
          Local Slices
        </Tab>
        <Tab
          selected={selectedTab === "library"}
          onClick={() => onSelectTab("library")}
        >
          Library Slices
        </Tab>
      </Box>
      {rightContent}
    </Box>
  );
}
