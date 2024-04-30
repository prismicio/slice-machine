import { Button, Text } from "@prismicio/editor-ui";
import { FC, ReactNode } from "react";

import styles from "./ZoneEmptyState.module.css";

type ZoneEmptyStateProps = {
  zoneType: "custom type" | "page type" | "slice";
  heading?: ReactNode;
  onEnterSelectMode: () => void;
};

export const ZoneEmptyState: FC<ZoneEmptyStateProps> = (props) => {
  const {
    zoneType,
    heading = `Your ${zoneType} has no fields yet`,
    onEnterSelectMode,
  } = props;

  return (
    <div className={styles.root}>
      <div>
        <Text variant="bold">{heading}</Text>
        <Text color="grey11">
          A field is an input for content (e.g. text, images, links).
        </Text>
      </div>
      <Button
        color="grey"
        onClick={() => onEnterSelectMode()}
        data-testid={`add-${zoneType.replace(" ", "-")}-field`}
        startIcon="add"
      >
        Add a field
      </Button>
    </div>
  );
};
