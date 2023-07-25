import React, { useRef } from "react";
import { Label } from "theme-ui";

import { acceptedImagesTypes } from "@lib/consts";

type HandleFileProp = {
  inputFile: React.RefObject<HTMLInputElement>;
  children?: React.ReactNode;
  handleFile: (file: File | undefined, isDragActive: boolean) => void;
  isDragActive: boolean;
};
type CustomScreenshotProps = {
  onHandleFile: (file: File, isDragActive: boolean) => void;
};

const FileInputRenderer: React.FC<HandleFileProp> = ({
  inputFile,
  handleFile,
  children,
  isDragActive,
}) => (
  <>
    <Label
      htmlFor="input-file"
      variant="buttons.white"
      sx={{
        p: 2,
        px: 0,
        display: "flex",
        justifyContent: "center",
        width: 200,
        alignItems: "center",
        flex: 1,
      }}
    >
      {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-nullish-coalescing */}
      {children || "Select file"}
    </Label>
    <input
      id="input-file"
      type="file"
      ref={inputFile}
      style={{ display: "none" }}
      accept={acceptedImagesTypes.map((type) => `image/${type}`).join(",")}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        handleFile(e.target.files?.[0], isDragActive);
      }}
    />
  </>
);

type CustomScreenshotPayload = {
  handleFile: HandleFileProp["handleFile"];
  inputFile: HandleFileProp["inputFile"];
  FileInputRenderer: React.FC<HandleFileProp>;
  fileInputProps: {
    inputFile: HandleFileProp["inputFile"];
    handleFile: HandleFileProp["handleFile"];
  };
};

export default function useCustomScreenshot({
  onHandleFile,
}: CustomScreenshotProps): CustomScreenshotPayload {
  const inputFile = useRef<HTMLInputElement>(null);
  const handleFile = (file: File | undefined, isDragActive: boolean) => {
    if (file) {
      onHandleFile(file, isDragActive);
      if (inputFile?.current) {
        inputFile.current.value = "";
      }
    }
  };

  return {
    handleFile,
    inputFile,
    FileInputRenderer,
    fileInputProps: {
      inputFile,
      handleFile,
    },
  };
}
