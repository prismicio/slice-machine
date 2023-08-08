import { useState } from "react";
import { Flex, Text, Spinner } from "theme-ui";
import { useHotkeys } from "react-hotkeys-hook";

import { acceptedImagesTypes } from "@lib/consts";
import { ToasterType } from "@src/modules/toaster";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { AiOutlineCloudUpload } from "react-icons/ai";

import useCustomScreenshot from "./useCustomScreenshot";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { ScreenshotPreview } from "@components/ScreenshotPreview";
import { ComponentUI } from "@lib/models/common/ComponentUI";

interface DropZoneProps {
  imageTypes?: string[];
  variationID: string;
  slice: ComponentUI;
}

const DragActiveView = () => {
  return (
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
  );
};

export const UploadIcon = ({
  isActive,
}: {
  isActive: boolean;
}): JSX.Element => (
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

const DropZone: React.FC<DropZoneProps> = ({
  variationID,
  slice,
  imageTypes = acceptedImagesTypes,
}) => {
  const maybeScreenshot = slice.screenshots[variationID];

  const { openToaster } = useSliceMachineActions();
  const [isDragActive, setIsDragActive] = useState(false);
  const [isHover, setIsHover] = useState(false);
  useHotkeys(["meta+v", "ctrl+v"], () => void handlePaste(), [
    variationID,
    slice,
  ]);

  const { generateSliceCustomScreenshot } = useSliceMachineActions();

  const { isLoadingScreenshot } = useSelector(
    (state: SliceMachineStoreType) => ({
      isLoadingScreenshot: isLoading(
        state,
        LoadingKeysEnum.GENERATE_SLICE_CUSTOM_SCREENSHOT
      ),
    })
  );

  const { FileInputRenderer, fileInputProps } = useCustomScreenshot({
    onHandleFile: (file: File, isDragActive: boolean) => {
      generateSliceCustomScreenshot(
        variationID,
        slice,
        file,
        isDragActive ? "dragAndDrop" : "upload"
      );
      setIsHover(false);
    },
  });

  const handleFile = (file: File) => {
    if (file.size > 128000000) {
      return openToaster(
        "File is too big. Max file size: 128Mb.",
        ToasterType.ERROR
      );
    }
    generateSliceCustomScreenshot(variationID, slice, file, "dragAndDrop");
  };

  const supportsClipboardRead = typeof navigator.clipboard.read === "function";

  const handlePaste = async () => {
    if (!supportsClipboardRead) return;
    try {
      const clipboardItems = await navigator.clipboard.read();
      if (clipboardItems[0] !== undefined) {
        const maybeType = clipboardItems[0].types.find((type) =>
          imageTypes.map((t) => `image/${t}`).includes(type)
        );
        if (maybeType !== undefined) {
          const blob = await clipboardItems[0].getType(maybeType);
          const file = new File([blob], "file");
          return handleFile(file);
        }
      }
    } catch (e) {
      console.error("Could not paste file", e);
    }
  };
  const handleDrop = (event: React.DragEvent<HTMLInputElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const maybeFile = event.dataTransfer.files?.[0];
    if (maybeFile !== undefined) {
      if (imageTypes.some((t) => `image/${t}` === maybeFile.type)) {
        return handleFile(maybeFile);
      }
      return openToaster(
        `Only files of type ${imageTypes.join(", ")} are accepted.`,
        ToasterType.ERROR
      );
    }
  };

  const createDragActiveState =
    (bool: boolean) => (e: React.DragEvent<HTMLInputElement>) => {
      e.preventDefault();
      setIsDragActive(bool);
    };

  const createHoverState =
    (bool: boolean) => (e: React.MouseEvent<HTMLInputElement>) => {
      e.preventDefault();
      setIsHover(bool);
    };

  return (
    <Flex
      as="form"
      variant="boxes.centered"
      sx={{
        bg: "#F9F8F9",
        position: "relative",
        borderRadius: "6px",
        height: "320px",
      }}
      onDragEnter={createDragActiveState(true)}
      onDragLeave={createDragActiveState(false)}
      onDragOver={createDragActiveState(true)}
      onMouseEnter={createHoverState(true)}
      onMouseLeave={createHoverState(false)}
      onSubmit={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {isLoadingScreenshot ? (
        <>
          <Spinner />
          <Text sx={{ my: 2 }}>Uploading file ...</Text>
        </>
      ) : null}
      {!isLoadingScreenshot && maybeScreenshot !== undefined ? (
        <ScreenshotPreview
          src={maybeScreenshot.url}
          sx={{
            width: "100%",
            height: "100%",
            maxHeight: "100%",
            backdropFilter: "blur(5px)",
          }}
        />
      ) : null}
      {!isLoadingScreenshot ? (
        <Flex
          sx={{
            p: 2,
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "6px",
            background: "#F9F8F9B2",
            justifyContent: "center",
            alignItems: "center",
            visibility:
              isHover || maybeScreenshot === undefined ? "visible" : "hidden",
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
            <Flex
              sx={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <UploadIcon isActive={isDragActive} />
              <Text sx={{ my: 2 }}>
                {supportsClipboardRead ? "Paste, drop or ..." : "Drop or ..."}
              </Text>
              <FileInputRenderer
                {...fileInputProps}
                isDragActive={isDragActive}
              />
              <Text sx={{ color: "greyIcon", mt: 1 }}>
                Maximum file size: 128Mb
              </Text>
            </Flex>
          </Flex>
        </Flex>
      ) : null}
      {isDragActive ? <DragActiveView /> : null}
    </Flex>
  );
};

export default DropZone;
