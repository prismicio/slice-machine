import { Badge, Box, Text, Tooltip } from "@prismicio/editor-ui";
import type { FC } from "react";

import { type NonSharedSliceInSliceZone } from "@models/common/CustomType/sliceZone";
import { Card, CardActions, CardFooter, CardMedia } from "@src/components/Card";
import { getNonSharedSliceLabel } from "@src/domain/slice";

import { ConvertLegacySliceButton } from "../convertLegacySlice/ConvertLegacySliceButton";

export type NonSharedSliceViewCardProps = {
  slice: NonSharedSliceInSliceZone;
  path: {
    customTypeID: string;
    tabID: string;
    sliceZoneID: string;
  };
};

export const NonSharedSliceViewCard: FC<NonSharedSliceViewCardProps> = ({
  slice,
  path,
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
        // TODO(DT-1675): use this commented `content` when the migration of Legacy Slices has been validated.
        // content="This Slice was created with the Legacy Builder. It needs to be converted first to be used within Slice Machine."
        content="This Slice was created with the Legacy Builder, and is incompatible with Slice Machine. You cannot edit, push, or delete it in Slice Machine. In order to proceed, manually remove the Slice from your type model. Then create a new Slice with the same fields using Slice Machine."
        side="bottom"
      >
        <Badge color="purple" title="Legacy Slice" />
      </Tooltip>
      {/* TODO(DT-1675): remove this `div` when the migration of Legacy Slices has been validated. */}
      <div style={{ display: "none" }}>
        <ConvertLegacySliceButton slice={slice} path={path} />
      </div>
    </CardActions>
    <CardFooter
      subtitle="1 variation"
      title={getNonSharedSliceLabel(slice.value)}
    />
  </Card>
);
