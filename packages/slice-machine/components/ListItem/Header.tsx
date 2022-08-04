import { TextWithTooltip } from "@components/Tooltip/TextWithTooltip";
import { IconType } from "react-icons";
import { Flex, Text, Theme } from "theme-ui";
import * as CSS from "csstype";

interface ItemHeaderProps {
  text: string;
  sliceFieldName: string | undefined;
  theme: Theme;
  WidgetIcon: IconType;
}

const ItemHeader: React.FC<ItemHeaderProps> = ({
  text,
  sliceFieldName,
  theme,
  WidgetIcon,
}) => (
  <Flex sx={{ alignItems: "center", position: "relative" }}>
    <WidgetIcon
      size={28}
      style={{
        color: theme.colors?.primary as CSS.Property.Color,
        marginRight: "8px",
        borderRadius: "4px",
        padding: "4px",
        border: "2px solid",
        borderColor: theme.colors?.primary as CSS.Property.Color,
      }}
    />
    <TextWithTooltip
      text={text}
      as="p"
      sx={{ py: 0, px: 1, fontWeight: "label", fontSize: "15px" }}
    />
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
