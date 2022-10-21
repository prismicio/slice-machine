import { useState } from "react";
import { Flex, Spinner, Text } from "theme-ui";
import { AiOutlineCloudUpload } from "react-icons/ai";

import { ViewRendererProps } from "./";
import { acceptedImagesTypes } from "@lib/consts";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";

import useCustomScreenshot from "../useCustomScreenshot";

const sharedFlexSx = {
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  width: "100%",
};

const UploadIcon = ({ isActive }: { isActive: boolean }): JSX.Element => (
  <Flex
    sx={{
      p: 1,
      borderRadius: "50%",
      bg: isActive ? "#F1EEFE" : "#EDECEE",
      alignItems: "center",
      justifyContent: "center",
      width: "48px",
      height: "48px",
    }}
  >
    <AiOutlineCloudUpload
      style={{ color: isActive ? "#6E56CF" : "#6F6E77", fontSize: "34px" }}
    />
  </Flex>
);

const EmptyState = ({
  variationID,
  slice,
  isLoadingScreenshot,
}: ViewRendererProps): JSX.Element => {
  const [isDragActive, setIsDragActive] = useState(false);
  const { generateSliceCustomScreenshot } = useSliceMachineActions();

  const { FileInputRenderer, fileInputProps, handleFile } = useCustomScreenshot(
    {
      onHandleFile: (file: File) => {
        generateSliceCustomScreenshot(
          variationID,
          slice,
          file,
          isDragActive ? "dragAndDrop" : "upload"
        );
      },
    }
  );

  const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const maybeFile = e.dataTransfer.files?.[0];
    if (maybeFile) {
      if (acceptedImagesTypes.find((t) => `image/${t}` === maybeFile.type)) {
        handleFile(maybeFile);
      }
    }
  };

  const createHandleDrag =
    (bool: boolean) => (e: React.DragEvent<HTMLInputElement>) => {
      e.preventDefault();
      setIsDragActive(bool);
    };

  return (
    <Flex
      sx={{
        p: 3,
        ...sharedFlexSx,
        bg: "secondary",
        borderRadius: "6px",
      }}
    >
      <Flex
        as="form"
        sx={{
          ...sharedFlexSx,
          borderRadius: "4px",
          border: isDragActive ? "1px dashed #6E56CF" : "1px dashed #DCDBDD",
        }}
        onDragEnter={createHandleDrag(true)}
        onDragLeave={createHandleDrag(false)}
        onDragOver={createHandleDrag(true)}
        onSubmit={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
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
      </Flex>
    </Flex>
  );
};

export default EmptyState;
