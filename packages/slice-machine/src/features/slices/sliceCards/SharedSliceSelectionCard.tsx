import { Box, Checkbox, Text } from "@prismicio/editor-ui";
import type { FC } from "react";

import { ComponentUI } from "@lib/models/common/ComponentUI";
import { Card, CardFooter, CardMedia } from "@src/components/Card";
import { getScreenshotUrl } from "@src/domain/slice";

type SharedSliceSelectionCardProps = {
  isComingSoon: boolean;
  onSelectedChange: (selected: boolean) => void;
  selected: boolean;
  slice: ComponentUI;
};

export const SharedSliceSelectionCard: FC<SharedSliceSelectionCardProps> = ({
  isComingSoon,
  onSelectedChange,
  selected,
  slice,
}) => {
  const defaultVariation = ComponentUI.variation(slice);
  if (!defaultVariation) return null;
  const src = getScreenshotUrl(slice, defaultVariation);
  return (
    <Card
      checked={selected}
      data-cy={`shared-slice-selection-card-${slice.model.id}`}
      data-testid="shared-slice-selection-card"
      disabled={isComingSoon}
      interactive
      onClick={() => {
        onSelectedChange(!selected);
      }}
      size="small"
      variant="outlined"
    >
      {src !== undefined ? (
        <CardMedia src={src} />
      ) : (
        <CardMedia component="div">
          <Box alignItems="center" justifyContent="center">
            <Text color="grey11" component="span">
              No screenshot available
            </Text>
          </Box>
        </CardMedia>
      )}
      <CardFooter
        action={
          // TODO(DT-1661): `findFocusableAncestor` should find Radix UI's `Checkbox`.
          <div onClick={(event) => event.stopPropagation()}>
            <Checkbox
              checked={selected}
              disabled={isComingSoon}
              onCheckedChange={onSelectedChange}
            />
          </div>
        }
        subtitle={
          <>
            {slice.model.variations.length} variation
            {slice.model.variations.length > 1 ? "s" : ""}
            {isComingSoon ? (
              <Text color="purple11" component="span" variant="small">
                {" "}
                • (coming soon)
              </Text>
            ) : undefined}
          </>
        }
        title={slice.model.name}
      />
    </Card>
  );
};
