import React from "react";
import { Box, Button, Text } from "theme-ui";
import { AiFillCamera, AiOutlineExclamationCircle } from "react-icons/ai";

import { ChangesSectionHeader } from "@components/ChangesSectionHeader";
import { CustomTypeTable } from "@components/CustomTypeTable/changesPage";

import Grid from "@components/Grid";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { WrapperType } from "@lib/models/ui/Slice/wrappers";
import { SharedSlice } from "@lib/models/ui/Slice";
import { ModelStatusInformation } from "@src/hooks/useModelStatus";

import ScreenshotChangesModal from "@components/ScreenshotChangesModal";
import { countMissingScreenshots } from "@src/utils/screenshots/missing";
import { useScreenshotChangesModal } from "@src/hooks/useScreenshotChangesModal";
import { ModelStatus } from "@lib/models/common/ModelStatus";
import { LocalOrRemoteCustomType } from "@lib/models/common/ModelData";

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
    (s) => modelsStatuses.slices[s.model.id] !== ModelStatus.Deleted
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
                      ModelStatus.Deleted
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
            gridTemplateMinPx="290px"
            defineElementKey={(slice: ComponentUI) => slice.model.name}
            renderElem={(slice: ComponentUI) => {
              return SharedSlice.render({
                showActions: true,
                slice: slice,
                wrapperType:
                  modelsStatuses.slices[slice.model.id] !== ModelStatus.Deleted
                    ? WrapperType.clickable
                    : WrapperType.nonClickable,
                StatusOrCustom: {
                  status: modelsStatuses.slices[slice.model.id],
                  authStatus,
                  isOnline,
                },
                actions: {
                  onUpdateScreenshot: (e: React.MouseEvent) => {
                    e.preventDefault();
                    onOpenModal({
                      sliceFilterFn: (s: ComponentUI[]) =>
                        s.filter((e) => e.model.id === slice.model.id),
                    });
                  },
                },
              });
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
