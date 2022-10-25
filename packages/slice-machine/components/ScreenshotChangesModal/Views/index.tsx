import { Flex } from "theme-ui";
import { FiUpload } from "react-icons/fi";

import { ComponentUI, ScreenshotUI } from "@lib/models/common/ComponentUI";

import useCustomScreenshot from "../useCustomScreenshot";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { isLoading } from "@src/modules/loading";

import EmptyState from "./EmptyState";
import DefaultView from "./Default";
import { AiOutlineEye } from "react-icons/ai";
import { selectIsWaitingForIFrameCheck } from "@src/modules/simulator";
import IframeRenderer from "@components/Simulator/components/IframeRenderer";
import { selectSimulatorUrl } from "@src/modules/environment";
import { useMemo } from "react";
import { Button } from "@components/Button";
import {
  ScreenSizeOptions,
  ScreenSizes,
} from "@components/Simulator/components/Toolbar/ScreensizeInput";

enum ScreenshotView {
  Default = 1,
  EmptyState,
}

export type ViewRendererProps = {
  slice: ComponentUI;
  screenshot: ScreenshotUI;
  variationID: string;
  isLoadingScreenshot: boolean;
};

const viewRenderer = {
  [ScreenshotView.Default]: DefaultView,
  [ScreenshotView.EmptyState]: EmptyState,
};

const VariationScreenshot: React.FC<{
  variationID: string;
  slice: ComponentUI;
}> = ({ variationID, slice }) => {
  const {
    isLoadingScreenshot,
    isWaitingForIframeCheck,
    simulatorUrl,
    isCheckingSimulatorSetup,
  } = useSelector((state: SliceMachineStoreType) => ({
    isLoadingScreenshot: isLoading(
      state,
      LoadingKeysEnum.GENERATE_SLICE_CUSTOM_SCREENSHOT
    ),
    isWaitingForIframeCheck: selectIsWaitingForIFrameCheck(state),
    simulatorUrl: selectSimulatorUrl(state),
    isCheckingSimulatorSetup: isLoading(state, LoadingKeysEnum.CHECK_SIMULATOR),
  }));
  const { generateSliceCustomScreenshot, checkSimulatorSetup } =
    useSliceMachineActions();
  const maybeScreenshot = slice.screenshots[variationID];

  const ViewRenderer = maybeScreenshot
    ? viewRenderer[ScreenshotView.Default]
    : viewRenderer[ScreenshotView.EmptyState];

  const { FileInputRenderer, fileInputProps } = useCustomScreenshot({
    onHandleFile: (file: File) => {
      generateSliceCustomScreenshot(variationID, slice, file, "upload");
    },
  });

  const sliceView = useMemo(
    () =>
      slice
        ? [
            {
              sliceID: slice.model.id,
              variationID: variationID,
            },
          ]
        : null,
    [slice.model.id, variationID]
  );

  if (!sliceView) return <></>;

  const openSimulator = () =>
    checkSimulatorSetup(true, () =>
      window.open(
        `/${slice?.href}/${slice?.model.name}/${variationID}/simulator`,
        slice.model.id
      )
    );

  return (
    <>
      <Flex sx={{ p: 2, pt: 0, minHeight: "48px" }}>
        <Button
          variant="white"
          sx={{
            marginRight: 2,
            px: 2,
          }}
          onClick={openSimulator}
          isLoading={isCheckingSimulatorSetup}
          Icon={AiOutlineEye}
          label={"Capture screenshot from Slice Simulator"}
        />
        {maybeScreenshot ? (
          <FileInputRenderer {...fileInputProps}>
            <>
              <FiUpload
                style={{
                  position: "relative",
                  marginRight: "8px",
                  fontSize: "14px",
                }}
              />
              Upload new screenshot
            </>
          </FileInputRenderer>
        ) : null}
      </Flex>
      <ViewRenderer
        slice={slice}
        variationID={variationID}
        screenshot={maybeScreenshot}
        isLoadingScreenshot={isLoadingScreenshot}
      />
      {isWaitingForIframeCheck && (
        <IframeRenderer
          dryRun
          simulatorUrl={simulatorUrl}
          sliceView={sliceView}
          screenDimensions={ScreenSizes[ScreenSizeOptions.DESKTOP]}
        />
      )}
    </>
  );
};

export default VariationScreenshot;
