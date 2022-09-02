import Grid from "@components/Grid";

import { SharedSlice, NonSharedSlice } from "@lib/models/ui/Slice";

import {
  NonSharedSliceInSliceZone,
  SliceZoneSlice,
} from "@lib/models/common/CustomType/sliceZone";
import { SlicesTypes } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { ModelStatusInformation } from "@src/hooks/useModelStatus";
import React from "react";

interface SlicesListProps extends ModelStatusInformation {
  slices: ReadonlyArray<SliceZoneSlice>;
}

export const SlicesList: React.FC<SlicesListProps> = ({
  slices,
  modelsStatuses,
  authStatus,
  isOnline,
}) => (
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
          bordered: true,
          displayStatus: true,
          slice: slice.payload as NonSharedSliceInSliceZone,
        });
      }
      return SharedSlice.render({
        slice: slice.payload as ComponentUI,
        bordered: true,
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
