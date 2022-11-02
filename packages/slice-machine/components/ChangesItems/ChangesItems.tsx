import React, { ReactNode } from "react";
import { Box, Button, Text } from "theme-ui";
import { AiFillCamera, AiOutlineExclamationCircle } from "react-icons/ai";

import { ChangesSectionHeader } from "@components/ChangesSectionHeader";
import { CustomTypeTable } from "@components/CustomTypeTable/changesPage";

import Grid from "components/Grid";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { WrapperType } from "@lib/models/ui/Slice/wrappers";
import { SharedSlice } from "@lib/models/ui/Slice";
import { FrontEndCustomType } from "@src/modules/availableCustomTypes/types";
import { ModelStatusInformation } from "@src/hooks/useModelStatus";
import { SyncError } from "@src/models/SyncError";
import { ApiError } from "@src/models/ApiError";
import { ErrorBanner } from "./ErrorBanner";

import ScreenshotChangesModal from "@components/ScreenshotChangesModal";
import { countMissingScreenshots } from "@src/utils/screenshots/missing";
import { useScreenshotChangesModal } from "@src/hooks/useScreenshotChangesModal";

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

  const { modalPayload, onOpenModal } = useScreenshotChangesModal();

  const { sliceFilterFn, defaultVariationSelector } = modalPayload;

  return (
    <>
      {unSyncedCustomTypes.length > 0 && (
        <>
          <ChangesSectionHeader>
            <Box>
              <Text variant="heading">Custom Types</Text>
              <Text variant="grey" sx={{ ml: "8px" }}>
                {unSyncedCustomTypes.length}
              </Text>
            </Box>
          </ChangesSectionHeader>
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
            <ChangesSectionHeader>
              <Box>
                <Text variant="heading">Slices</Text>
                <Text variant="grey" sx={{ ml: "8px" }}>
                  {unSyncedSlices.length}
                </Text>
              </Box>
              <Box>
                {unSyncedSlices.some(
                  (slice) => countMissingScreenshots(slice) > 0
                ) && (
                  <Text
                    sx={{
                      mr: 3,
                      color: "warning02",
                      fontSize: "12px",
                      lineHeight: "16px",
                      fontWeight: 600,
                    }}
                  >
                    <AiOutlineExclamationCircle
                      size={16}
                      style={{
                        marginRight: "4px",
                        position: "relative",
                        top: "3px",
                      }}
                    />
                    Missing Screenshots
                  </Text>
                )}
                <Button
                  variant="darkSmall"
                  onClick={() => onOpenModal({ sliceFilterFn: (s) => s })}
                >
                  <AiFillCamera
                    style={{
                      color: "#FFF",
                      fontSize: "15px",
                      position: "relative",
                      top: "3px",
                      marginRight: "4px",
                    }}
                  />{" "}
                  Update all screenshots
                </Button>
              </Box>
            </ChangesSectionHeader>
          </Box>
          {slicesError}
          <Grid
            gridGap="32px 16px"
            elems={unSyncedSlices}
            gridTemplateMinPx="290px"
            defineElementKey={(slice: ComponentUI) => slice.model.name}
            renderElem={(slice: ComponentUI) => {
              return SharedSlice.render({
                showActions: true,
                slice: slice,
                wrapperType: WrapperType.clickable,
                StatusOrCustom: {
                  status: modelsStatuses.slices[slice.model.id],
                  authStatus,
                  isOnline,
                },
                onUpdateScreenshot: (e: React.MouseEvent) => {
                  e.preventDefault();
                  onOpenModal({
                    sliceFilterFn: (s: ComponentUI[]) =>
                      s.filter((e) => e.model.id === slice.model.id),
                  });
                },
                sx: changesPushed.includes(slice.model.id)
                  ? { animation: "fadeout .4s linear forwards" }
                  : {},
              });
            }}
          />
          <ScreenshotChangesModal
            slices={sliceFilterFn(unSyncedSlices)}
            defaultVariationSelector={defaultVariationSelector}
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
