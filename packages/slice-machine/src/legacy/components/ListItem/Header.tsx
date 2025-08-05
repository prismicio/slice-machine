import { Box, Tooltip } from "@prismicio/editor-ui";
import * as CSS from "csstype";
import { IconType } from "react-icons";
import { Flex, Text, Theme } from "theme-ui";

import { Field, fieldLabels } from "@/domain/fields";
import { TextWithTooltip } from "@/legacy/components/Tooltip/TextWithTooltip";

interface ItemHeaderProps {
  text: string;
  sliceFieldName: string | undefined;
  theme: Theme;
  WidgetIcon: IconType;
  type: Field["type"];
}

const ItemHeader: React.FC<ItemHeaderProps> = ({
  text,
  sliceFieldName,
  theme,
  WidgetIcon,
  type,
}) => (
  <Flex sx={{ alignItems: "center", position: "relative" }}>
    <Tooltip content={fieldLabels[type]}>
      <Box>
        <WidgetIcon
          size={28}
          style={{
            color: theme.colors?.primary as CSS.Property.Color,
            marginRight: "8px",
            borderRadius: "4px",
            padding: "4px",
            border: "2px solid",
            borderColor: theme.colors?.primary as CSS.Property.Color,
            flexShrink: 0,
          }}
        />
      </Box>
    </Tooltip>
    <TextWithTooltip
      text={text}
      as="p"
      sx={{ py: 0, px: 1, fontWeight: "label", fontSize: "15px" }}
      data-testid="field-name"
    />
    <Text
      as="p"
      sx={{
        display: ["none", "none", "initial"],
        fontSize: "14px",
        ml: 1,
        color: "textClear",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      data-testid="field-id"
    >
      {sliceFieldName}
    </Text>
  </Flex>
);

export default ItemHeader;
