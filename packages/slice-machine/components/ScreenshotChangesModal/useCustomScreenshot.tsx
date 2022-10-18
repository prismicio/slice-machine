import React, { useRef } from "react";
import { Label } from "theme-ui";

import { acceptedImagesTypes } from "@lib/consts";

type HandleFileProp = {
  inputFile: React.RefObject<HTMLInputElement>;
  children?: React.ReactNode;
  handleFile: (file: File | undefined) => void;
};
type CustomScreenshotProps = {
  onHandleFile: (file: File) => void;
};

const FileInputRenderer: React.FC<HandleFileProp> = ({
  inputFile,
  handleFile,
  children,
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
      }}
    >
      {children || "Select file"}
    </Label>
    <input
      id="input-file"
      type="file"
      ref={inputFile}
      style={{ display: "none" }}
      accept={acceptedImagesTypes.map((type) => `image/${type}`).join(",")}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        handleFile(e.target.files?.[0])
      }
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
  const handleFile = (file: File | undefined) => {
    if (file) {
      onHandleFile(file);
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
