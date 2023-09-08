import Grid from "@components/Grid";

import { SharedSlice, NonSharedSlice } from "@lib/models/ui/Slice";

import {
  NonSharedSliceInSliceZone,
  SliceZoneSlice,
} from "@lib/models/common/CustomType/sliceZone";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { ModelStatusInformation } from "@src/hooks/useModelStatus";
import React, { useEffect } from "react";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { ToasterType } from "@src/modules/toaster";
import { CustomTypeFormat } from "@slicemachine/manager";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";

interface SlicesListProps extends ModelStatusInformation {
  format: CustomTypeFormat;
  slices: ReadonlyArray<SliceZoneSlice>;
  path: {
    customTypeID: string;
    tabID: string;
    sliceZoneID: string;
  };
}

export const SlicesList: React.FC<SlicesListProps> = ({
  slices,
  modelsStatuses,
  authStatus,
  isOnline,
  format,
  path,
}) => {
  const hasLegacySlices = slices.some((slice) => slice.type !== "SharedSlice");
  const customTypesMessages = CUSTOM_TYPES_MESSAGES[format];

  const { openToaster } = useSliceMachineActions();

  useEffect(() => {
    if (hasLegacySlices)
      openToaster(
        `This ${customTypesMessages.name({
          start: false,
          plural: false,
        })} contains Slices that are incompatible.`,
        ToasterType.WARNING
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLegacySlices]);

  return (
    <Grid
      elems={slices}
      defineElementKey={(slice: SliceZoneSlice) => {
        if (slice.type !== "SharedSlice") {
          // NonsharedSlice
          return (slice.payload as NonSharedSliceInSliceZone).key;
        }
        return (slice.payload as ComponentUI).model.name;
      }}
      renderElem={(slice: SliceZoneSlice) => {
        if (slice.type !== "SharedSlice") {
          return NonSharedSlice.Render({
            slice: slice.payload as NonSharedSliceInSliceZone,
            path,
          });
        }
        return SharedSlice.Render({
          slice: slice.payload as ComponentUI,
          StatusOrCustom: {
            status:
              modelsStatuses.slices[(slice.payload as ComponentUI).model.id],
            authStatus,
            isOnline,
          },
        });
      }}
      sx={{ padding: "16px" }}
    />
  );
};
