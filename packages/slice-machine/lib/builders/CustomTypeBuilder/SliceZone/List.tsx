import React, { useEffect } from "react";

import Grid from "@components/Grid";
import {
  NonSharedSliceInSliceZone,
  SliceZoneSlice,
} from "@lib/models/common/CustomType/sliceZone";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { ToasterType } from "@src/modules/toaster";
import { CustomTypeFormat } from "@slicemachine/manager";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";
import { NonSharedSliceViewCard } from "@src/features/slices/sliceCards/NonSharedSliceViewCard";
import { SharedSliceViewCard } from "@src/features/slices/sliceCards/SharedSliceViewCard";

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
      defineElementKey={(slice) =>
        slice.type === "Slice"
          ? (slice.payload as NonSharedSliceInSliceZone).key
          : (slice.payload as ComponentUI).model.name
      }
      renderElem={(slice) => {
        if (slice.type === "Slice") {
          const nonSharedSlice = (slice.payload as NonSharedSliceInSliceZone)
            .value;
          return <NonSharedSliceViewCard slice={nonSharedSlice} />;
        } else {
          const sharedSlice = slice.payload as ComponentUI;
          return (
            <SharedSliceViewCard
              action={{
                type: "remove",
                onRemove: () => {
                  onRemoveSharedSlice(sharedSlice.model.id);
                },
              }}
              isDeletedSlice={false}
              onUpdateScreenshot={undefined}
              slice={sharedSlice}
            />
          );
        }
      }}
      sx={{ padding: "16px" }}
    />
  );
};
