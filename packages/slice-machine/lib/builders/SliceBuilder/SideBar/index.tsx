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

const PreviewState: React.FunctionComponent<BottomStateProps> = ({
  isPreviewSetup,
  openSetupPreview,
  router,
}) => {
  return isPreviewSetup ? (
    <Link
      href={{
        pathname: `${router.pathname}/preview`,
        query: router.query,
      }}
      passHref
    >
      <a target="_blank">
        <Button
          variant="secondary"
          sx={{ cursor: "pointer", width: "100%", mt: 3 }}
        >
          Open Slice Preview
        </Button>
      </a>
    </Link>
  ) : (
    <InformationBox>
      <>
        <Heading as="h5" sx={{ color: "text", mb: 2 }}>
          Configure slice preview
        </Heading>
        <Text as="p" variant="xs" sx={{ mb: 2 }}>
          You can preview your slices and view changes instantly
        </Text>
        <Button
          variant={"small"}
          sx={{ cursor: "pointer" }}
          onClick={openSetupPreview}
        >
          Setup the preview
        </Button>
      </>
    </InformationBox>
  );
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
            Slice Preview is not supported by your framework. You can use
            Storybook instead.
          </Text>
        </>
      ) : (
        <PreviewState
          isPreviewSetup={isPreviewSetup}
          openSetupPreview={openSetupPreview}
          router={router}
        />
      )}
    </Box>
  );
};

const InformationBox: React.FunctionComponent = ({ children }) => (
  <ThemeCard mt={3}>
    <Flex
      as="li"
      sx={{
        p: 3,
        borderBottom: "1px solid",
        borderColor: "borders",
        alignItems: "center",
        textDecoration: "none",
        color: "inherit",
        position: "relative",
      }}
    >
      <Box>{children}</Box>
    </Flex>
  </ThemeCard>
);

export default SideBar;
