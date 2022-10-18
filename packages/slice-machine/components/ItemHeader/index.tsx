import React from "react";
import { Flex, Text } from "theme-ui";
import type { Theme } from "theme-ui";

const ItemHeader: React.FC<{
  text: React.ReactNode;
  sliceFieldName: React.ReactNode;
  theme: Theme;
  WidgetIcon: React.ElementType;
}> = ({ text, sliceFieldName, theme, WidgetIcon }) => (
  <Flex sx={{ alignItems: "center" }}>
    <WidgetIcon
      size={28}
      style={{
        color: theme.colors?.primary,
        marginRight: "8px",
        borderRadius: "4px",
        padding: "4px",
        border: "2px solid",
        borderColor: theme.colors?.primary,
      }}
    />
    <Text
      as="p"
      sx={{
        py: 0,
        px: 1,
        fontWeight: "label",
        fontSize: "15px",
      }}
    >
      {text}
    </Text>
    <Text
      as="p"
      sx={{
        display: ["none", "none", "initial"],
        fontSize: "14px",
        ml: 1,
        color: "textClear",
      }}
    >
      {sliceFieldName}
    </Text>
  </Flex>
);

export default ItemHeader;
