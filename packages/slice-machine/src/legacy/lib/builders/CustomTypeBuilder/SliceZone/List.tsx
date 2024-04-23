import { CustomTypeFormat } from "@slicemachine/manager";
import React, { useEffect } from "react";
import { toast } from "react-toastify";

import { CUSTOM_TYPES_MESSAGES } from "@/features/customTypes/customTypesMessages";
import { useLab } from "@/features/labs/labsList/useLab";
import { NonSharedSliceCard } from "@/features/slices/sliceCards/NonSharedSliceCard";
import { SharedSliceCard } from "@/features/slices/sliceCards/SharedSliceCard";
import Grid from "@/legacy/components/Grid";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import {
  NonSharedSliceInSliceZone,
  SliceZoneSlice,
} from "@/legacy/lib/models/common/CustomType/sliceZone";

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

  useEffect(() => {
    if (hasLegacySlices)
      legacySliceUpgraderLab.enabled
        ? toast.info(
            `This ${customTypesMessages.name({
              start: false,
              plural: false,
            })} contains legacy slices that can be upgraded.`,
          )
        : toast.warning(
            `This ${customTypesMessages.name({
              start: false,
              plural: false,
            })} contains slices that are incompatible.`,
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
