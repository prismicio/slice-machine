import React, { useEffect } from "react";
import { IconButton } from "@prismicio/editor-ui";

import Grid from "@components/Grid";
import { SharedSlice, NonSharedSlice } from "@lib/models/ui/Slice";
import {
  NonSharedSliceInSliceZone,
  SliceZoneSlice,
} from "@lib/models/common/CustomType/sliceZone";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { ToasterType } from "@src/modules/toaster";
import { CustomTypeFormat } from "@slicemachine/manager";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";

interface SlicesListProps {
  format: CustomTypeFormat;
  slices: ReadonlyArray<SliceZoneSlice>;
  onRemoveSharedSlice: (sliceId: string) => void;
}

export const SlicesList: React.FC<SlicesListProps> = ({
  slices,
  format,
  onRemoveSharedSlice,
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
          StatusOrCustom: () => (
            // Prevent the Grid to redirect to the slice builder page
            // TODO(DT-1601): See with editor team if it's possible to have the event param in the IconButton onClick
            <div
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <IconButton
                icon="close"
                onClick={() => {
                  onRemoveSharedSlice((slice.payload as ComponentUI).model.id);
                }}
              />
            </div>
          ),
        });
      }}
      sx={{ padding: "16px" }}
    />
  );
};
