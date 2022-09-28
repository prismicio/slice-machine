import { Box, Flex, Heading, Text, useThemeUI } from "theme-ui";

const FieldTypeCard = ({ title, description, icon: WidgetIcon, onSelect }) => {
  const { theme } = useThemeUI();
  return (
    <Flex
      sx={{
        p: 3,
        my: 2,
        alignItems: "center",
        cursor: "pointer",
        borderRadius: "3px",
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        border: (t) => `1px solid ${t.colors?.borders}`,
        "&:hover": {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          border: ({ colors }) => `1px solid ${colors.primary}`,
          boxShadow: "0 0 0 3px rgba(81, 99, 186, 0.2)",
        },
      }}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data-cy={title}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      onClick={onSelect}
    >
      <WidgetIcon
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions
        label={`Select field of type "${title}"`}
        style={{
          color: theme.colors.primary,
          marginRight: "8px",
          borderRadius: "4px",
          padding: "5px",
          border: "2px solid",
          borderColor: theme.colors.primary,
        }}
        size={32}
      />
      <Box ml={1}>
        <Heading as="h4" sx={{ fontSize: 1 }}>
          <b>{title}</b>
        </Heading>
        <Text as="p" variant="xs">
          {description}
        </Text>
      </Box>
    </Flex>
  );
};

export default FieldTypeCard;
