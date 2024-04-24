import { Button, Text } from "@prismicio/editor-ui";
import { Box } from "theme-ui";

import styles from "./ZoneEmptyState.module.css";

export const ZoneEmptyState = ({
  onEnterSelectMode,
  zoneName,
}: {
  // eslint-disable-next-line @typescript-eslint/ban-types
  onEnterSelectMode: Function;
  zoneName: string;
}) => (
  <div className={styles.root}>
    <Text variant="bold">Add a new field here</Text>
    <Text color="grey11">
      Fields are inputs for content (e.g. text, images, links).
    </Text>
    <Box sx={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
      <Button
        color="grey"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        onClick={() => onEnterSelectMode()}
        data-testid={`add-${zoneName}-field`}
        startIcon="add"
      >
        Add new
      </Button>
    </Box>
  </div>
);
