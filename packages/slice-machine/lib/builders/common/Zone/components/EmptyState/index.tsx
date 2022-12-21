import { Box, Button, Text, Heading } from "theme-ui";
import { FaPlus } from "react-icons/fa";

const ZoneEmptyState = ({
  onEnterSelectMode,
  zoneName,
}: {
  // eslint-disable-next-line @typescript-eslint/ban-types
  onEnterSelectMode: Function;
  zoneName: string;
}) => (
  <Box sx={{ textAlign: "center", my: 4 }}>
    <Heading as="h5">Add a new field here</Heading>
    <Box sx={{ my: 2 }}>
      <Text sx={{ color: "textClear" }}>
        Add a field to your {zoneName} Zone
      </Text>
    </Box>
    <Button
      mt={3}
      variant="buttons.darkSmall"
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      onClick={() => onEnterSelectMode()}
      data-cy={`empty-${zoneName}-add-field`}
    >
      <FaPlus
        style={{ marginRight: "8px", position: "relative", top: "2px" }}
      />{" "}
      Add a new field
    </Button>
  </Box>
);

export default ZoneEmptyState;
