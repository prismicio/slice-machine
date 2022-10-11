import { Flex, Button, Spinner } from "theme-ui";
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
import { Size } from "@components/Simulator/components/ScreenSizes";
import { selectSimulatorUrl } from "@src/modules/environment";
import { useMemo } from "react";

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

function VariationScreenshot({
  variationID,
  slice,
}: {
  variationID: string;
  slice: ComponentUI;
}): JSX.Element {
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

  const { Renderer } = useCustomScreenshot({
    slice,
    variationID,
    onHandleFile: generateSliceCustomScreenshot,
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
        `/${slice?.href}/${slice?.model.name}/${variationID}/simulator`
      )
    );

  return (
    <>
      <Flex sx={{ p: 2, pt: 0, minHeight: "48px" }}>
        <Button
          variant="white"
          sx={{
            p: 2,
            px: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            marginRight: 2,
          }}
          onClick={openSimulator}
          disabled={isCheckingSimulatorSetup}
        >
          {isCheckingSimulatorSetup ? (
            <Spinner
              data-cy="builder-save-button-spinner"
              color="#1A1523"
              size={24}
              mr={2}
            />
          ) : (
            <AiOutlineEye
              size={24}
              style={{
                marginRight: "8px",
                position: "relative",
              }}
            />
          )}
          Capture screenshot from Slice Simulator
        </Button>
        {maybeScreenshot ? (
          <Renderer>
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
          </Renderer>
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
          size={Size.FULL}
          simulatorUrl={simulatorUrl}
          sliceView={sliceView}
        />
      )}
    </>
  );
}

export default VariationScreenshot;
