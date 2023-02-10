import Grid from "@components/Grid";

import { SharedSlice, NonSharedSlice } from "@lib/models/ui/Slice";

import {
  NonSharedSliceInSliceZone,
  SliceZoneSlice,
} from "@lib/models/common/CustomType/sliceZone";
import { SlicesTypes } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { ModelStatusInformation } from "@src/hooks/useModelStatus";
import React, { useEffect } from "react";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { ToasterType } from "@src/modules/toaster";
import { Link, Text } from "theme-ui";
import { LEGACY_SLICE_MIGRATION_GUIDE } from "@lib/consts";

interface SlicesListProps extends ModelStatusInformation {
  slices: ReadonlyArray<SliceZoneSlice>;
}

const MigrateSliceToast = () => (
  <Text>
    This Custom Type contains legacy Slices. Follow our{" "}
    <Link
      href={LEGACY_SLICE_MIGRATION_GUIDE}
      target="_"
      sx={{ color: "white" }}
    >
      migration recommendations
    </Link>
    .
  </Text>
);

export const SlicesList: React.FC<SlicesListProps> = ({
  slices,
  modelsStatuses,
  authStatus,
  isOnline,
}) => {
  const hasLegacySlices = slices.some(
    (slice) => slice.type === SlicesTypes.Slice
  );

  const { openToaster } = useSliceMachineActions();

  useEffect(() => {
    if (hasLegacySlices)
      openToaster(<MigrateSliceToast />, ToasterType.WARNING);
  }, [hasLegacySlices]);

  return (
    <Grid
      elems={slices}
      defineElementKey={(slice: SliceZoneSlice) => {
        if (slice.type === SlicesTypes.Slice) {
          // NonsharedSlice
          return (slice.payload as NonSharedSliceInSliceZone).key;
        }
        return (slice.payload as ComponentUI).model.name;
      }}
      renderElem={(slice: SliceZoneSlice) => {
        if (slice.type === SlicesTypes.Slice) {
          return NonSharedSlice.render({
            slice: slice.payload as NonSharedSliceInSliceZone,
          });
        }
        return SharedSlice.render({
          slice: slice.payload as ComponentUI,
          StatusOrCustom: {
            status:
              modelsStatuses.slices[(slice.payload as ComponentUI).model.id],
            authStatus,
            isOnline,
          },
        });
      }}
    />
  );
};
