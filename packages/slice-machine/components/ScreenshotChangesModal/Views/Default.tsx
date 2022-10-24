import { Text, Flex, Spinner } from "theme-ui";

import { ViewRendererProps } from "./";

import DropZone from "../DropZone";

import { ScreenshotPreview } from "@components/ScreenshotPreview";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

export default function DefaultView({
  slice,
  screenshot,
  variationID,
  isLoadingScreenshot,
}: ViewRendererProps) {
  const { generateSliceCustomScreenshot } = useSliceMachineActions();
  const handleValidDrop = (file: File) => {
    generateSliceCustomScreenshot(variationID, slice, file);
  };

  return (
    <DropZone onHandleDrop={handleValidDrop}>
      {isLoadingScreenshot ? (
        <Flex
          sx={{
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
            bg: "secondary",
            flexDirection: "column",
          }}
        >
          <Spinner />
          <Text sx={{ my: 2 }}>Uploading file ...</Text>
        </Flex>
      ) : (
        <ScreenshotPreview
          src={screenshot.url}
          sx={{ width: "100%", height: "100%", maxHeight: "100%" }}
        />
      )}
    </DropZone>
  );
}
