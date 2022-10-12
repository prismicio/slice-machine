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
  const { isLoadingScreenshot } = useSelector(
    (state: SliceMachineStoreType) => ({
      isLoadingScreenshot: isLoading(
        state,
        LoadingKeysEnum.GENERATE_SLICE_CUSTOM_SCREENSHOT
      ),
    })
  );
  const { generateSliceCustomScreenshot } = useSliceMachineActions();
  const maybeScreenshot = slice.screenshots[variationID];

  const ViewRenderer = maybeScreenshot
    ? viewRenderer[ScreenshotView.Default]
    : viewRenderer[ScreenshotView.EmptyState];

  const { Renderer } = useCustomScreenshot({
    slice,
    variationID,
    onHandleFile: generateSliceCustomScreenshot,
  });

  return (
    <>
      <Flex sx={{ p: 2, pt: 0, minHeight: "48px" }}>
        {maybeScreenshot ? (
          <Renderer>
            <>
              <FiUpload
                style={{
                  position: "relative",
                  top: "3px",
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
    </>
  );
}

export default VariationScreenshot;
