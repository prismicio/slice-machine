import { Flex, Spinner, Text } from "theme-ui";

import { ViewRendererProps } from "./";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";

import useCustomScreenshot from "../useCustomScreenshot";
import DropZone, { UploadIcon } from "../DropZone";

const EmptyState = ({
  variationID,
  slice,
  isLoadingScreenshot,
}: ViewRendererProps): JSX.Element => {
  const { generateSliceCustomScreenshot } = useSliceMachineActions();

  const { FileInputRenderer, fileInputProps } = useCustomScreenshot({
    onHandleFile: (file: File) => {
      generateSliceCustomScreenshot(variationID, slice, file);
    },
  });

  const handleValidDrop = (file: File) => {
    generateSliceCustomScreenshot(variationID, slice, file);
  };

  return (
    <DropZone isVisible onHandleDrop={handleValidDrop}>
      {({ isDragActive }) => (
        <Flex
          sx={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          {isLoadingScreenshot ? (
            <>
              <Spinner />
              <Text sx={{ my: 2 }}>Uploading file ...</Text>
            </>
          ) : (
            <>
              <UploadIcon isActive={isDragActive} />
              <Text sx={{ my: 2 }}>Drop file to upload or ...</Text>
              <FileInputRenderer {...fileInputProps} />
              <Text sx={{ color: "greyIcon", mt: 1 }}>
                Maximum file size: 128Mb
              </Text>
            </>
          )}
        </Flex>
      )}
    </DropZone>
  );
};

export default EmptyState;
