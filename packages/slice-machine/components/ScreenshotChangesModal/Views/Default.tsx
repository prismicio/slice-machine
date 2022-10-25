import { Text, Flex, Spinner } from "theme-ui";

import { ViewRendererProps } from "./";

import DropZone, { UploadIcon } from "../DropZone";

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
      {({ isDragActive }) => (
        <>
          {isDragActive ? (
            <Flex
              variant="boxes.centered"
              sx={{
                p: 2,
                position: "absolute",
                height: "100%",
                width: "100%",
                background: "rgba(249, 248, 249, 0.7)",
                backdropFilter: "blur(5px)",
                zIndex: "1",
                pointerEvents: "none",
              }}
            >
              <Flex
                variant="boxes.centered"
                sx={{
                  border: "1px dashed #6E56CF",
                  height: "100%",
                  width: "100%",
                  borderRadius: "4px",
                }}
              >
                <UploadIcon isActive />
                <Text sx={{ my: 2 }}>Drop file here</Text>
                <Text variant="secondary">Maximum upload size file: 128Mb</Text>
              </Flex>
            </Flex>
          ) : null}
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
              sx={{
                width: "100%",
                height: "100%",
                maxHeight: "100%",
                backdropFilter: "blur(5px)",
              }}
            />
          )}
        </>
      )}
    </DropZone>
  );
}
