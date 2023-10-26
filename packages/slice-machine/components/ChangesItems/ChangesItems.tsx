import React from "react";
import { Box, Button, Text } from "theme-ui";
import { AiFillCamera, AiOutlineExclamationCircle } from "react-icons/ai";

import { ChangesSectionHeader } from "@components/ChangesSectionHeader";
import { CustomTypeTable } from "@components/CustomTypeTable/changesPage";

import Grid from "@components/Grid";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { ModelStatusInformation } from "@src/hooks/useModelStatus";

import ScreenshotChangesModal from "@components/ScreenshotChangesModal";
import { countMissingScreenshots } from "@src/domain/slice";
import { useScreenshotChangesModal } from "@src/hooks/useScreenshotChangesModal";
import { ModelStatus } from "@lib/models/common/ModelStatus";
import { LocalOrRemoteCustomType } from "@lib/models/common/ModelData";
import { SharedSliceCard } from "@src/features/slices/sliceCards/SharedSliceCard";

interface ChangesItemsProps extends ModelStatusInformation {
  unSyncedCustomTypes: LocalOrRemoteCustomType[];
  unSyncedSlices: ComponentUI[];
}

export const ChangesItems: React.FC<ChangesItemsProps> = ({
  unSyncedCustomTypes,
  unSyncedSlices,
  modelsStatuses,
  authStatus,
  isOnline,
}) => {
  const { modalPayload, onOpenModal } = useScreenshotChangesModal();

  const { sliceFilterFn, defaultVariationSelector } = modalPayload;

  const screenshotChangesSlices = unSyncedSlices.filter(
    (s) => modelsStatuses.slices[s.model.id] !== ModelStatus.Deleted,
  );

  return (
    <>
      {unSyncedCustomTypes.length > 0 && (
        <>
          <ChangesSectionHeader>
            <Box>
              <Text variant="heading">Types</Text>
              <Text variant="grey" sx={{ ml: "8px" }}>
                {unSyncedCustomTypes.length}
              </Text>
            </Box>
          </ChangesSectionHeader>
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
                  (slice) =>
                    countMissingScreenshots(slice) > 0 &&
                    modelsStatuses.slices[slice.model.id] !==
                      ModelStatus.Deleted,
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
          <Grid
            gridGap="32px 16px"
            elems={unSyncedSlices}
            gridTemplateMinPx="305px"
            defineElementKey={(slice) => slice.model.name}
            renderElem={(slice) => {
              const modelStatus = modelsStatuses.slices[slice.model.id];
              return (
                <SharedSliceCard
                  action={{ type: "status", authStatus, isOnline, modelStatus }}
                  isDeleted={modelStatus === ModelStatus.Deleted}
                  mode="navigation"
                  onUpdateScreenshot={() => {
                    onOpenModal({
                      sliceFilterFn: (s) =>
                        s.filter((e) => e.model.id === slice.model.id),
                    });
                  }}
                  slice={slice}
                  variant="solid"
                />
              );
            }}
          />
          <ScreenshotChangesModal
            slices={sliceFilterFn(screenshotChangesSlices)}
            defaultVariationSelector={defaultVariationSelector}
          />
        </>
      )}
    </>
  );
};
