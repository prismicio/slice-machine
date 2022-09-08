import { ChangesSectionHeader } from "@components/ChangesSectionHeader";
import { CustomTypeTable } from "@components/CustomTypeTable/changesPage";
import React, { ReactNode } from "react";
import { Box } from "theme-ui";
import Grid from "components/Grid";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { WrapperType } from "@lib/models/ui/Slice/wrappers";
import { SharedSlice } from "@lib/models/ui/Slice";
import { FrontEndCustomType } from "@src/modules/availableCustomTypes/types";
import { ModelStatusInformation } from "@src/hooks/useModelStatus";
import { SyncError } from "@src/models/SyncError";
import { ApiError } from "@src/models/ApiError";
import { ErrorBanner } from "./ErrorBanner";

interface ChangesItemsProps extends ModelStatusInformation {
  unSyncedCustomTypes: FrontEndCustomType[];
  unSyncedSlices: ComponentUI[];
  changesPushed: string[];
  syncError: SyncError | null;
}

export const ChangesItems: React.FC<ChangesItemsProps> = ({
  unSyncedCustomTypes,
  unSyncedSlices,
  changesPushed,
  syncError,
  modelsStatuses,
  authStatus,
  isOnline,
}) => {
  const { customTypeError, slicesError } = getSyncErrors(syncError);
  return (
    <>
      {unSyncedCustomTypes.length > 0 && (
        <>
          <ChangesSectionHeader
            text={"Custom Types"}
            amount={unSyncedCustomTypes.length}
          />
          {customTypeError}
          <CustomTypeTable
            customTypes={unSyncedCustomTypes}
            modelsStatuses={modelsStatuses}
            authStatus={authStatus}
            isOnline={isOnline}
          />
        </>
      )}
      {unSyncedSlices.length > 0 && (
        <>
          <Box sx={{ mb: "8px" }}>
            <ChangesSectionHeader
              text={"Slices"}
              amount={unSyncedSlices.length}
            />
          </Box>
          {slicesError}
          <Grid
            elems={unSyncedSlices}
            defineElementKey={(slice: ComponentUI) => slice.model.name}
            gridTemplateMinPx="290px"
            renderElem={(slice: ComponentUI) => {
              return SharedSlice.render({
                slice: slice,
                wrapperType: WrapperType.clickable,
                StatusOrCustom: {
                  status: modelsStatuses.slices[slice.model.id],
                  authStatus,
                  isOnline,
                },
                sx: changesPushed.includes(slice.model.id)
                  ? { animation: "fadeout .4s linear forwards" }
                  : {},
              });
            }}
            gridGap="32px 16px"
          />
        </>
      )}
    </>
  );
};

function getSyncErrors(syncError: SyncError | null): {
  customTypeError: ReactNode | null;
  slicesError: ReactNode | null;
} {
  if (syncError && syncError.type === "custom type") {
    if (syncError.error === ApiError.INVALID_MODEL)
      return {
        customTypeError: (
          <ErrorBanner
            message="We couldn’t push the following Custom Types. Check your Custom Types models and retry."
            sx={{ m: "8px 0px" }}
          />
        ),
        slicesError: null,
      };
  }

  if (syncError && syncError.type === "slice") {
    if (syncError.error === ApiError.INVALID_MODEL)
      return {
        customTypeError: null,
        slicesError: (
          <ErrorBanner message="We couldn’t push the following Slices. Check your Slices models and retry." />
        ),
      };
  }

  return { customTypeError: null, slicesError: null };
}
