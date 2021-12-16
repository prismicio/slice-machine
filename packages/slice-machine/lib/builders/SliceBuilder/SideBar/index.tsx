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
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

const MemoizedImagePreview = memo(ImagePreview);

type SideBarProps = {
  Model: SliceState;
  variation: Models.VariationAsArray;
  imageLoading: boolean;
  onScreenshot: () => void;
  onHandleFile: (file: any) => void;
};

const SideBar: React.FunctionComponent<SideBarProps> = ({
  Model,
  variation,
  imageLoading,
  onScreenshot,
  onHandleFile,
}) => {
  const { screenshotUrls } = Model;

  const { checkPreviewSetup } = useSliceMachineActions();

  const router = useRouter();

  const { isPreviewAvailableForFramework } = useSelector(
    (state: SliceMachineStoreType) => ({
      isPreviewAvailableForFramework:
        selectIsPreviewAvailableForFramework(state),
    })
  );

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
          onClick={() => checkPreviewSetup(`${router.asPath}/preview`, true)}
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
