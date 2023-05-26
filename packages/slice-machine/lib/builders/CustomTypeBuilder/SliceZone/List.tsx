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
import { CustomTypeFormat } from "@slicemachine/manager/*";
import { CUSTOM_TYPES_CONFIG } from "@src/features/customTypes/customTypesConfig";

interface SlicesListProps extends ModelStatusInformation {
  format: CustomTypeFormat;
  slices: ReadonlyArray<SliceZoneSlice>;
}

export const SlicesList: React.FC<SlicesListProps> = ({
  slices,
  modelsStatuses,
  authStatus,
  isOnline,
  format,
}) => {
  const hasLegacySlices = slices.some((slice) => slice.type !== "SharedSlice");
  const customTypesConfig = CUSTOM_TYPES_CONFIG[format];

  const { openToaster } = useSliceMachineActions();

  useEffect(() => {
    if (hasLegacySlices)
      openToaster(
        `This ${customTypesConfig.name} contains Slices that are incompatible.`,
        ToasterType.WARNING
      );
  }, [hasLegacySlices]);

  return (
    <Grid
      elems={slices}
      defineElementKey={(slice: SliceZoneSlice) => {
        if (slice.type === "Slice") {
          // NonsharedSlice
          return (slice.payload as NonSharedSliceInSliceZone).key;
        }
        return (slice.payload as ComponentUI).model.name;
      }}
      renderElem={(slice: SliceZoneSlice) => {
        if (slice.type === "Slice") {
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
