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

import { Button } from "@components/Button";
import { SIMULATOR_WINDOW_ID } from "@lib/consts";
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
  const { isLoadingScreenshot, isSimulatorAvailableForFramework } = useSelector(
    (state: SliceMachineStoreType) => ({
      isLoadingScreenshot: isLoading(
        state,
        LoadingKeysEnum.GENERATE_SLICE_CUSTOM_SCREENSHOT
      ),
      isSimulatorAvailableForFramework:
        selectIsSimulatorAvailableForFramework(state),
    })
  );
  const { generateSliceCustomScreenshot } = useSliceMachineActions();
  const maybeScreenshot = slice.screenshots[variationID];

  const ViewRenderer = maybeScreenshot
    ? viewRenderer[ScreenshotView.Default]
    : viewRenderer[ScreenshotView.EmptyState];

  const { FileInputRenderer, fileInputProps } = useCustomScreenshot({
    onHandleFile: (file: File) => {
      generateSliceCustomScreenshot(variationID, slice, file, "upload");
    },
  });

  const openSimulator = () =>
    window.open(
      `/${slice?.href}/${slice?.model.name}/${variationID}/simulator`,
      SIMULATOR_WINDOW_ID
    );

  return (
    <>
      <Flex sx={{ p: 2, pt: 0, minHeight: "48px" }}>
        {isSimulatorAvailableForFramework ? (
          <Button
            variant="white"
            sx={{
              marginRight: 2,
              px: 2,
            }}
            onClick={openSimulator}
            Icon={AiOutlineEye}
            label={"Capture screenshot from Slice Simulator"}
          />
        ) : null}
        {maybeScreenshot ? (
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
        ) : null}
      </Flex>
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
