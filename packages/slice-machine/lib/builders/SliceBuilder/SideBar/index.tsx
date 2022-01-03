import React, { memo } from "react";
import type Models from "@slicemachine/core/build/src/models";
import { Box, Button, Spinner, Text } from "theme-ui";
import Link from "next/link";

import Card from "@components/Card";

import ImagePreview from "./components/ImagePreview";
import SliceState from "@lib/models/ui/SliceState";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isLoading } from "@src/modules/loading";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import {
  selectIsPreviewAvailableForFramework,
  getFramework,
  getStorybookUrl,
} from "@src/modules/environment";

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

  const {
    isCheckingPreviewSetup,
    isPreviewAvailableForFramework,
    framework,
    storybook,
  } = useSelector((state: SliceMachineStoreType) => ({
    framework: getFramework(state),
    isCheckingPreviewSetup: isLoading(state, LoadingKeysEnum.CHECK_PREVIEW),
    isPreviewAvailableForFramework: selectIsPreviewAvailableForFramework(state),
    storybook: getStorybookUrl(state),
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
        <StoryBookOrPreview linkToStorybook={storybook} framework={framework} />
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

function storyBookInstallLink(framework?: string) {
  switch (framework) {
    case "react":
      return "https://storybook.js.org/docs/react/get-started/install";
    case "vue":
      return "https://storybook.js.org/docs/vue/get-started/install";
    case "svelte":
      return "https://storybook.js.org/docs/svelte/get-started/install";
    default:
      return "https://storybook.js.org/";
  }
}

const StoryBookOrPreview: React.FC<{
  linkToStorybook: string | null;
  framework?: string;
}> = ({ linkToStorybook, framework }) => {
  if (linkToStorybook) {
    return (
      <Link href={linkToStorybook}>
        <Button sx={{ width: "100%", mt: 3 }}>Open Storybook</Button>
      </Link>
    );
  }

  return (
    <>
      <Button variant="disabledSecondary" sx={{ width: "100%", mt: 3 }}>
        Open Slice Preview
      </Button>
      <Text
        as="p"
        sx={{
          textAlign: "center",
          mt: 3,
          color: "textGray",
          "::first-letter": {
            "text-transform": "uppercase",
          },
        }}
      >
        {framework
          ? `${framework} does not support Slice Preview.`
          : "Slice Preview is not supported by your framework."}{" "}
        You can <a href={storyBookInstallLink(framework)}>install Storybook</a>{" "}
        instead.
      </Text>
    </>
  );
};

export default SideBar;
