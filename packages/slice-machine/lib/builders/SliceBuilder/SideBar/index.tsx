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
  getLinkToStorybookDocs,
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
    linkToStorybookDocs,
    framework,
    storybookUrl,
  } = useSelector((state: SliceMachineStoreType) => ({
    framework: getFramework(state),
    linkToStorybookDocs: getLinkToStorybookDocs(state),
    isCheckingPreviewSetup: isLoading(state, LoadingKeysEnum.CHECK_PREVIEW),
    isPreviewAvailableForFramework: selectIsPreviewAvailableForFramework(state),
    storybookUrl: getStorybookUrl(state),
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
      <Button
        data-testid="open-set-up-preview"
        disabled={!isPreviewAvailableForFramework}
        onClick={() =>
          checkPreviewSetup(true, () => window.open(`${router.asPath}/preview`))
        }
        variant={
          isPreviewAvailableForFramework ? "secondary" : "disabledSecondary"
        }
        sx={{ cursor: "pointer", width: "100%", mt: 3 }}
      >
        {isCheckingPreviewSetup ? <Spinner size={12} /> : "Open Slice Preview"}
      </Button>
      {!isPreviewAvailableForFramework && (
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
            : "Slice Preview is not supported by your framework."}
          &nbsp;
          {!storybookUrl ? (
            <>
              You can{" "}
              <a target={"_blank"} href={linkToStorybookDocs}>
                install Storybook
              </a>{" "}
              instead.
            </>
          ) : null}
        </Text>
      )}

      {storybookUrl && (
        <Link href={storybookUrl}>
          <Button variant={"secondary"} sx={{ width: "100%", mt: 3 }}>
            Open Storybook
          </Button>
        </Link>
      )}
    </Box>
  );
};

export default SideBar;
