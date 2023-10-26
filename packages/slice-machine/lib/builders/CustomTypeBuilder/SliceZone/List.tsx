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
import { NonSharedSliceCard } from "@src/features/slices/sliceCards/NonSharedSliceCard";
import { SharedSliceCard } from "@src/features/slices/sliceCards/SharedSliceCard";
import { useLab } from "@src/features/labs/labsList/useLab";

interface SlicesListProps {
  format: CustomTypeFormat;
  slices: ReadonlyArray<SliceZoneSlice>;
  path: {
    customTypeID: string;
    tabID: string;
    sliceZoneID: string;
  };
  onRemoveSharedSlice: (sliceId: string) => void;
}

export const SlicesList: React.FC<SlicesListProps> = ({
  slices,
  format,
  path,
  onRemoveSharedSlice,
}) => {
  const hasLegacySlices = slices.some((slice) => slice.type !== "SharedSlice");
  const customTypesMessages = CUSTOM_TYPES_MESSAGES[format];

  const [legacySliceUpgraderLab] = useLab("legacySliceUpgrader");

  const { openToaster } = useSliceMachineActions();

  useEffect(() => {
    if (hasLegacySlices)
      legacySliceUpgraderLab.enabled
        ? openToaster(
            `This ${customTypesMessages.name({
              start: false,
              plural: false,
            })} contains legacy slices that can be upgraded.`,
            ToasterType.INFO,
          )
        : openToaster(
            `This ${customTypesMessages.name({
              start: false,
              plural: false,
            })} contains slices that are incompatible.`,
            ToasterType.WARNING,
          );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLegacySlices]);

  return (
    <Grid
      elems={slices}
      defineElementKey={(slice) =>
        slice.type !== "SharedSlice"
          ? (slice.payload as NonSharedSliceInSliceZone).key
          : (slice.payload as ComponentUI).model.name
      }
      renderElem={(slice) => {
        if (slice.type !== "SharedSlice") {
          const nonSharedSlice = slice.payload as NonSharedSliceInSliceZone;
          return <NonSharedSliceCard slice={nonSharedSlice} path={path} />;
        } else {
          const sharedSlice = slice.payload as ComponentUI;
          return (
            <SharedSliceCard
              action={{
                type: "remove",
                onRemove: () => {
                  onRemoveSharedSlice(sharedSlice.model.id);
                },
              }}
              mode="navigation"
              slice={sharedSlice}
              variant="solid"
            />
          );
        }
      }}
      sx={{ padding: "16px" }}
    />
  );
};
