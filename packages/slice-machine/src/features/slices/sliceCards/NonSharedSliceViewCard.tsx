import { Badge, Box, Text, Tooltip } from "@prismicio/editor-ui";
import type { FC } from "react";

import { type NonSharedSliceInSliceZone } from "@models/common/CustomType/sliceZone";
import { ConvertLegacySliceModal } from "@components/Forms/ConvertLegacySliceModal";
import { Card, CardActions, CardFooter, CardMedia } from "@src/components/Card";
import { getNonSharedSliceLabel } from "@src/domain/slice";

type NonSharedSliceViewCardProps = {
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
        content="This Slice was created with the Legacy Builder. It needs to be converted first to be used within Slice Machine."
        side="bottom"
      >
        <Badge color="purple" title="Legacy Slice" />
      </Tooltip>
      <ConvertLegacySliceModal slice={slice} path={path} />
    </CardActions>
    <CardFooter subtitle="1 variation" title={getNonSharedSliceLabel(slice.value)} />
  </Card>
);
