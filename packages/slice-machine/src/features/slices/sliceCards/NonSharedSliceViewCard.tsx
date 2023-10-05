import { Badge, Box, Text, Tooltip } from "@prismicio/editor-ui";
import type { FC } from "react";

import { Card, CardActions, CardFooter, CardMedia } from "@src/components/Card";
import { getNonSharedSliceLabel, type NonSharedSlice } from "@src/domain/slice";

type NonSharedSliceViewCardProps = {
  slice: NonSharedSlice;
};

export const NonSharedSliceViewCard: FC<NonSharedSliceViewCardProps> = ({
  slice,
}) => (
  <Card>
    <CardMedia component="div">
      <Box alignItems="center" justifyContent="center">
        <Text color="grey11" component="span">
          No screenshot available
        </Text>
      </Box>
    </CardMedia>
    <CardActions>
      <Tooltip
        content="This Slice was created with the Legacy Builder, and is incompatible with Slice Machine. You cannot edit, push, or delete it in Slice Machine. In order to proceed, manually remove the Slice from your type model. Then create a new Slice with the same fields using Slice Machine."
        side="bottom"
      >
        <Badge color="purple" title="Legacy Slice" />
      </Tooltip>
    </CardActions>
    <CardFooter subtitle="1 variation" title={getNonSharedSliceLabel(slice)} />
  </Card>
);
