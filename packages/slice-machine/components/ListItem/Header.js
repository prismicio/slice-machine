import { Flex, Text } from "theme-ui";

const ItemHeader = ({
  text,
  sliceFieldName,
  theme,
  WidgetIcon,
  hasModelError,
}) => (
  <Flex sx={{ alignItems: "center", position: "relative" }}>
    <WidgetIcon
      size={28}
      style={{
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        color: theme.colors.primary,
        marginRight: "8px",
        borderRadius: "4px",
        padding: "4px",
        border: "2px solid",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        borderColor: theme.colors.primary,
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
        color: hasModelError ? "critical" : "textClear",
      }}
    >
      {sliceFieldName}
    </Text>
  </Flex>
);

export default ItemHeader;
