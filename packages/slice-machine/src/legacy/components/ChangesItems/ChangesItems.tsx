import { Box, Button, Text } from "@prismicio/editor-ui";
import React, { Suspense } from "react";
import { AiFillCamera, AiOutlineExclamationCircle } from "react-icons/ai";

import { countMissingScreenshots } from "@/domain/slice";
import { ErrorBoundary } from "@/ErrorBoundary";
import { SharedSliceCard } from "@/features/slices/sliceCards/SharedSliceCard";
import { ModelsStatuses } from "@/features/sync/getUnSyncChanges";
import { useScreenshotChangesModal } from "@/hooks/useScreenshotChangesModal";
import { ChangesSectionHeader } from "@/legacy/components/ChangesSectionHeader";
import { CustomTypeTable } from "@/legacy/components/CustomTypeTable/changesPage";
import Grid from "@/legacy/components/Grid";
import ScreenshotChangesModal from "@/legacy/components/ScreenshotChangesModal";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { LocalOrRemoteCustomType } from "@/legacy/lib/models/common/ModelData";
import { ModelStatus } from "@/legacy/lib/models/common/ModelStatus";
import { AuthStatus } from "@/modules/userContext/types";

import { DevCollaborationExperiment } from "./DevCollaborationExperiment";

interface ChangesItemsProps {
  unSyncedCustomTypes: LocalOrRemoteCustomType[];
  unSyncedSlices: ComponentUI[];
  modelsStatuses: ModelsStatuses;
  authStatus: AuthStatus;
  isOnline: boolean;
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
      <Box gap={16} alignItems="flex-start">
        <Box flexDirection="column" flexGrow={1}>
          {unSyncedCustomTypes.length > 0 && (
            <Box flexDirection="column">
              <ChangesSectionHeader>
                <Box>
                  <Text variant="h5">Types</Text>
                  <Text variant="h5" sx={{ marginLeft: 8 }}>
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
            </Box>
          )}
          {unSyncedSlices.length > 0 && (
            <>
              <Box padding={{ bottom: 8 }}>
                <ChangesSectionHeader>
                  <Box>
                    <Text variant="h5">Slices</Text>
                    <Text variant="h5" sx={{ marginLeft: 8 }}>
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
                        color="amber11"
                        sx={{
                          marginRight: 8,
                          alignSelf: "center",
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
                      color="dark"
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
                      action={{
                        type: "status",
                        authStatus,
                        isOnline,
                        modelStatus,
                      }}
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
        </Box>

        <ErrorBoundary>
          <Suspense>
            <DevCollaborationExperiment />
          </Suspense>
        </ErrorBoundary>
      </Box>
    </>
  );
};
