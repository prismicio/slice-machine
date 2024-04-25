import { Button, Text } from "@prismicio/editor-ui";
import { FC } from "react";

import styles from "./ZoneEmptyState.module.css";

type ZoneEmptyStateProps = {
  onEnterSelectMode: () => void;
  zoneName: string;
};

export const ZoneEmptyState: FC<ZoneEmptyStateProps> = (props) => {
  const { zoneName, onEnterSelectMode } = props;

  return (
    <div className={styles.root}>
      <div>
        <Text variant="bold">No fields</Text>
        <Text color="grey11">
          Fields are inputs for content (e.g. text, images, links).
        </Text>
      </div>
      <Button
        color="grey"
        onClick={() => onEnterSelectMode()}
        data-testid={`add-${zoneName}-field`}
        startIcon="add"
      >
        Add new
      </Button>
    </div>
  );
};
