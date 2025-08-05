import { FieldType } from "@prismicio/types-internal/lib/customtypes";
import React from "react";
import type { Theme } from "theme-ui";
import { Flex, Text } from "theme-ui";

import { fieldLabels } from "@/domain/fields";

const ItemHeader: React.FC<{
  type: FieldType;
  sliceFieldName: React.ReactNode;
  theme: Theme;
  WidgetIcon: React.ElementType;
}> = ({ type, sliceFieldName, theme, WidgetIcon }) => (
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
      data-testid="item-header-text"
      sx={{
        py: 0,
        px: 1,
        fontWeight: "label",
        fontSize: "15px",
      }}
    >
      {fieldLabels[type]}
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
