import React, { memo } from "react";
import type Models from "@slicemachine/core/build/src/models";
import { Box, Button, Text } from "theme-ui";

import Card from "@components/Card";

import ImagePreview from "./components/ImagePreview";
import SliceState from "@lib/models/ui/SliceState";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectIsPreviewAvailableForFramework } from "@src/modules/environment";
import { checkPreviewSetup } from "@src/apiClient";
import { useToasts } from "react-toast-notifications";
import { PreviewSetupStatus } from "@builders/SliceBuilder";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

const MemoizedImagePreview = memo(ImagePreview);

type SideBarProps = {
  Model: SliceState;
  variation: Models.VariationAsArray;
  imageLoading: boolean;
  onScreenshot: () => void;
  setPreviewSetupStatus: (previewSetupStatus: PreviewSetupStatus) => void;
  onHandleFile: (file: any) => void;
};

const SideBar: React.FunctionComponent<SideBarProps> = ({
  Model,
  variation,
  imageLoading,
  onScreenshot,
  onHandleFile,
  setPreviewSetupStatus,
}) => {
  const { screenshotUrls } = Model;

  const { openSetupDrawerDrawer } = useSliceMachineActions();

  const router = useRouter();
  const { addToast } = useToasts();

  const { isPreviewAvailableForFramework } = useSelector(
    (state: SliceMachineStoreType) => ({
      isPreviewAvailableForFramework:
        selectIsPreviewAvailableForFramework(state),
    })
  );

  const onOpenPreview = async () => {
    try {
      const { data: previewSetupState } = await checkPreviewSetup();

      // All the backend checks are ok
      if (
        "ok" === previewSetupState.manifest &&
        "ok" === previewSetupState.dependencies
      ) {
        window.open(`${router.asPath}/preview`);
        return;
      }

      setPreviewSetupStatus({ iframe: null, ...previewSetupState });
      openSetupDrawerDrawer();
    } catch (e) {
      // Server crash
      if (e.response.status === 500) {
        addToast(e.response.data.err, { appearance: "error" });
      }
    }
  };

  return (
    <Box
      sx={{
        pl: 3,
        flexGrow: 1,
        flexBasis: "sidebar",
      }}
    >
      <Card bg="headSection" bodySx={{ p: 0 }} footerSx={{ p: 0 }}>
        <MemoizedImagePreview
          src={
            screenshotUrls &&
            screenshotUrls[variation.id] &&
            screenshotUrls[variation.id].url
          }
          imageLoading={imageLoading}
          onScreenshot={onScreenshot}
          onHandleFile={onHandleFile}
          preventScreenshot={false}
        />
      </Card>
      {!isPreviewAvailableForFramework ? (
        <>
          <Button variant="disabledSecondary" sx={{ width: "100%", mt: 3 }}>
            Open Slice Preview
          </Button>
          <Text as="p" sx={{ textAlign: "center", mt: 3, color: "textGray" }}>
            Framework does not support Slice Preview. You can install Storybook
            instead.
          </Text>
        </>
      ) : (
        <Button
          onClick={onOpenPreview}
          variant={"secondary"}
          sx={{ cursor: "pointer", width: "100%", mt: 3 }}
        >
          Open Slice Preview
        </Button>
      )}
    </Box>
  );
};

export default SideBar;
