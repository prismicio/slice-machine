import React, { memo } from "react";
import type Models from "@slicemachine/core/build/src/models";
import { Box, Button, Spinner, Text } from "theme-ui";

import Card from "@components/Card";

import ImagePreview from "./components/ImagePreview";
import SliceState from "@lib/models/ui/SliceState";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectIsPreviewAvailableForFramework } from "@src/modules/environment";
import { isLoading } from "@src/modules/loading";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { LoadingKeysEnum } from "@src/modules/loading/types";

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

  const { isPreviewAvailableForFramework, isCheckingPreviewSetup } =
    useSelector((state: SliceMachineStoreType) => ({
      isPreviewAvailableForFramework:
        selectIsPreviewAvailableForFramework(state),
      isCheckingPreviewSetup: isLoading(state, LoadingKeysEnum.CHECK_PREVIEW),
    }));

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
          preventScreenshot={!isPreviewAvailableForFramework}
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
          onClick={() =>
            checkPreviewSetup(true, () =>
              window.open(`${router.asPath}/preview`)
            )
          }
          variant={"secondary"}
          sx={{ cursor: "pointer", width: "100%", mt: 3 }}
        >
          {isCheckingPreviewSetup ? (
            <Spinner size={12} />
          ) : (
            "Open Slice Preview"
          )}
        </Button>
      )}
    </Box>
  );
};

export default SideBar;
