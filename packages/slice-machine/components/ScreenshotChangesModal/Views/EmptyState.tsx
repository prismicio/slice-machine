import { useState } from "react";
import { Flex, Spinner, Text } from "theme-ui";
import { AiOutlineCloudUpload } from "react-icons/ai";

import { ViewRendererProps } from "./";
import { acceptedImagesTypes } from "@lib/consts";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";

import useCustomScreenshot from "../useCustomScreenshot";

const UploadIcon = () => (
  <Flex
    sx={{
      p: 1,
      borderRadius: "50%",
      bg: "#F1EEFE",
      alignItems: "center",
      justifyContent: "center",
      width: "48px",
      height: "48px",
    }}
  >
    <AiOutlineCloudUpload style={{ color: "#6E56CF", fontSize: "34px" }} />
  </Flex>
);

const EmptyState = ({
  variationID,
  slice,
  isLoadingScreenshot,
}: ViewRendererProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const { generateSliceCustomScreenshot } = useSliceMachineActions();

  const { Renderer, handleFile } = useCustomScreenshot({
    slice,
    variationID,
    onHandleFile: generateSliceCustomScreenshot,
  });

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
      as="form"
      sx={{
        justifyContent: "center",
        alignItems: "center",
        height: "90%",
        width: "100%",
        bg: "secondary",
        border: isDragActive ? "1px solid red" : "initial",
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
          <Spinner sx={{ mb: 2 }} />
        ) : (
          <>
            <UploadIcon />
            <Text sx={{ my: 2 }}>Drop file to upload or ...</Text>
          </>
        )}
        <Renderer />
        <Text sx={{ color: "greyIcon", mt: 1 }}>Maximum file size: 128Mb</Text>
      </Flex>
    </Flex>
  );
};

export default EmptyState;
