import React, { memo } from "react";
import type Models from "@slicemachine/core/build/src/models";
import { Box, Button, Card as ThemeCard, Flex, Heading, Text } from "theme-ui";
import Link from "next/link";
import { NextRouter } from "next/router";

import Card from "@components/Card";

import ImagePreview from "./components/ImagePreview";
import SliceState from "@lib/models/ui/SliceState";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectIsPreviewAvailableForFramework } from "@src/modules/environment";
import { checkPreviewSetup } from "@src/apiClient";

const MemoizedImagePreview = memo(ImagePreview);

type SideBarProps = {
  Model: SliceState;
  variation: Models.VariationAsArray;
  imageLoading: boolean;
  isPreviewSetup: boolean;
  onScreenshot: () => void;
  onHandleFile: (file: any) => void;
  openSetupPreview: () => void;
};

type BottomStateProps = {
  isPreviewSetup: boolean;
  openSetupPreview: () => void;
  router: NextRouter;
};

const SideBar: React.FunctionComponent<SideBarProps> = ({
  Model,
  variation,
  imageLoading,
  isPreviewSetup,
  onScreenshot,
  onHandleFile,
  openSetupPreview,
}) => {
  const { screenshotUrls } = Model;

  const router = useRouter();

  const { isPreviewAvailableForFramework } = useSelector(
    (state: SliceMachineStoreType) => ({
      isPreviewAvailableForFramework:
        selectIsPreviewAvailableForFramework(state),
    })
  );

  const onOpenPreview = async () => {
    await checkPreviewSetup();
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
          preventScreenshot={!isPreviewSetup}
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
