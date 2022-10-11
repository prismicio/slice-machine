import React, { useRef } from "react";
import { Label } from "theme-ui";

import { acceptedImagesTypes } from "@lib/consts";
import { ComponentUI } from "@lib/models/common/ComponentUI";

type CSProps = {
  variationID: string;
  slice: ComponentUI;
  onHandleFile: (variationID: string, slice: ComponentUI, file: File) => void;
};

export default function useCustomScreenshot({
  onHandleFile,
  variationID,
  slice,
}: CSProps) {
  const inputFile = useRef<HTMLInputElement>(null);
  const handleFile = (file: File | undefined) => {
    if (file) {
      onHandleFile(variationID, slice, file);
      if (inputFile?.current) {
        inputFile.current.value = "";
      }
    }
  };

  return {
    handleFile,
    inputFile,
    Renderer: ({ children }: { children?: React.ReactNode }) => {
      return (
        <>
          <Label
            htmlFor="input-file"
            variant="buttons.white"
            sx={{
              p: 2,
              px: 3,
              display: "flex",
              justifyContent: "center",
              flex: 1,
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
            accept={acceptedImagesTypes
              .map((type) => `image/${type}`)
              .join(",")}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleFile(e.target.files?.[0])
            }
          />
        </>
      );
    },
  };
}
