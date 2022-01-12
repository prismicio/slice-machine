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
  selectIsSimulatorAvailableForFramework,
  getFramework,
  getStorybookUrl,
  getLinkToStorybookDocs,
} from "@src/modules/environment";
import { createStorybookUrl } from "@src/utils/storybook";

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

  const { checkSimulatorSetup } = useSliceMachineActions();

  const router = useRouter();

  const {
    isCheckingSimulatorSetup,
    isSimulatorAvailableForFramework,
    linkToStorybookDocs,
    framework,
    storybookUrl,
  } = useSelector((state: SliceMachineStoreType) => ({
    framework: getFramework(state),
    linkToStorybookDocs: getLinkToStorybookDocs(state),
    isCheckingSimulatorSetup: isLoading(state, LoadingKeysEnum.CHECK_SIMULATOR),
    isSimulatorAvailableForFramework:
      selectIsSimulatorAvailableForFramework(state),
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
          preventScreenshot={!isSimulatorAvailableForFramework}
        />
      </Card>
      <Button
        data-testid="open-set-up-simulator"
        disabled={!isSimulatorAvailableForFramework}
        onClick={() =>
          checkSimulatorSetup(true, () =>
            window.open(`${router.asPath}/simulator`)
          )
        }
        variant={
          isSimulatorAvailableForFramework ? "secondary" : "disabledSecondary"
        }
        sx={{ cursor: "pointer", width: "100%", mt: 3 }}
      >
        {isCheckingSimulatorSetup ? (
          <Spinner size={12} />
        ) : (
          "Open Slice Simulator"
        )}
      </Button>
      {!isSimulatorAvailableForFramework && (
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
          {`Slice Simulator does not support ${
            framework || "your"
          } framework yet.`}
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
        <Link
          href={createStorybookUrl({
            storybook: storybookUrl,
            libraryName: Model.from,
            sliceName: Model.infos.sliceName,
            variationId: variation.id,
          })}
        >
          <Button variant={"secondary"} sx={{ width: "100%", mt: 3 }}>
            Open Storybook
          </Button>
        </Link>
      )}
    </Box>
  );
};

export default SideBar;
