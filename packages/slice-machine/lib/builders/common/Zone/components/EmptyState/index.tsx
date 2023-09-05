import { Box, Text, Heading } from "theme-ui";
import { Button } from "@prismicio/editor-ui";

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
    <Box sx={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
      <Button
        variant="secondary"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        onClick={() => onEnterSelectMode()}
        data-cy={`add-${zoneName}-field`}
        startIcon="add"
      >
        Add a new field
      </Button>
    </Box>
  </Box>
);

export default ZoneEmptyState;
