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

import { selectIsSimulatorAvailableForFramework } from "@src/modules/environment";

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
    isSimulatorAvailableForFramework: _isSimulatorAvailableForFramework,
  } = useSelector((state: SliceMachineStoreType) => ({
    isLoadingScreenshot: isLoading(
      state,
      LoadingKeysEnum.GENERATE_SLICE_CUSTOM_SCREENSHOT
    ),
    isSimulatorAvailableForFramework:
      selectIsSimulatorAvailableForFramework(state),
  }));
  const { generateSliceCustomScreenshot } = useSliceMachineActions();
  const maybeScreenshot = slice.screenshots[variationID];

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const ViewRenderer = maybeScreenshot
    ? viewRenderer[ScreenshotView.Default]
    : viewRenderer[ScreenshotView.EmptyState];

  const { FileInputRenderer, fileInputProps } = useCustomScreenshot({
    onHandleFile: (file: File) => {
      generateSliceCustomScreenshot(variationID, slice, file, "upload");
    },
  });

  // TODO(DT-1534): Uncomment to enable Puppeteer screenshots or delete if we decide to remove Puppeteer
  // const openSimulator = () =>
  //   window.open(
  //     `/${slice?.href}/${slice?.model.name}/${variationID}/simulator`,
  //     SIMULATOR_WINDOW_ID
  //   );

  return (
    <>
      {/* 
        // TODO(DT-1534): Uncomment to enable Puppeteer screenshots or delete if we decide to remove Puppeteer
        {isSimulatorAvailableForFramework ? (
          <Button
            variant="white"
            sx={{
              marginRight: 2,
              px: 2,
            }}
            onClick={openSimulator}
            Icon={AiOutlineEye}
            iconFill="#1A1523"
            label={"Capture screenshot from Slice Simulator"}
          />
        ) : null} */}
      {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
      {maybeScreenshot ? (
        <Flex sx={{ p: 2, pt: 0, minHeight: "48px" }}>
          <FileInputRenderer {...fileInputProps} isDragActive={false}>
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
        </Flex>
      ) : null}
      <ViewRenderer
        slice={slice}
        variationID={variationID}
        screenshot={maybeScreenshot}
        isLoadingScreenshot={isLoadingScreenshot}
      />
    </>
  );
};

export default VariationScreenshot;
