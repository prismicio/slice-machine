import { Badge, Box, Text, Tooltip } from "@prismicio/editor-ui";
import type { FC } from "react";

import { Card, CardActions, CardFooter, CardMedia } from "@/components/Card";
import { getNonSharedSliceLabel } from "@/domain/slice";
import { useLab } from "@/features/labs/labsList/useLab";
import { type NonSharedSliceInSliceZone } from "@/legacy/lib/models/common/CustomType/sliceZone";

import { ConvertLegacySliceButton } from "../convertLegacySlice/ConvertLegacySliceButton";

export type NonSharedSliceCardProps = {
  slice: NonSharedSliceInSliceZone;
  path: {
    customTypeID: string;
    tabID: string;
    sliceZoneID: string;
  };
};

export const NonSharedSliceCard: FC<NonSharedSliceCardProps> = ({
  slice,
  path,
}) => {
  const [legacySliceUpgraderLab] = useLab("legacySliceUpgrader");

  const tooltipContent = legacySliceUpgraderLab.enabled
    ? "This Slice was created with the Legacy Builder. It needs to be converted first to be used within Slice Machine."
    : "This Slice was created with the Legacy Builder, and is incompatible with Slice Machine. You cannot edit, push, or delete it in Slice Machine. In order to proceed, manually remove the Slice from your type model. Then create a new Slice with the same fields using Slice Machine.";

  return (
    <Card>
      <CardMedia component="div">
        <Box alignItems="center" justifyContent="center">
          <Text color="grey11" component="span">
            No screenshot available
          </Text>
        </Box>
      </CardMedia>
      <CardActions>
        <Tooltip content={tooltipContent} side="bottom">
          <Badge color="purple" title="Legacy Slice" />
        </Tooltip>
        {legacySliceUpgraderLab.enabled ? (
          <ConvertLegacySliceButton slice={slice} path={path} />
        ) : null}
      </CardActions>
      <CardFooter
        subtitle="1 variation"
        title={getNonSharedSliceLabel(slice.value)}
      />
    </Card>
  );
};
