import { ReactNode, useState } from "react";
import { Flex } from "theme-ui";
import { acceptedImagesTypes } from "@lib/consts";
import { ToasterType } from "@src/modules/toaster";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

const sharedFlexSx = {
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  width: "100%",
};

interface DropZoneProps {
  isVisible?: boolean;
  onHandleDrop: (file: File) => void;
  imageTypes?: string[];
  children: ReactNode | ((options: { isDragActive: boolean }) => ReactNode);
}

const DropZone: React.FC<DropZoneProps> = ({
  children,
  onHandleDrop,
  isVisible = false,
  imageTypes = acceptedImagesTypes,
}) => {
  const { openToaster } = useSliceMachineActions();
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLInputElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const maybeFile = event.dataTransfer.files?.[0];
    if (maybeFile) {
      if (imageTypes.find((t) => `image/${t}` === maybeFile.type)) {
        if (maybeFile.size > 128000000) {
          return openToaster(
            "File is too big. Max file size: 128Mo.",
            ToasterType.SCREENSHOT_FAILED
          );
        }
        return onHandleDrop(maybeFile);
      }
      return openToaster(
        `Only files of type ${imageTypes.join(", ")} are accepted.`,
        ToasterType.SCREENSHOT_FAILED
      );
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
        p: 2,
        ...sharedFlexSx,
        ...(isVisible || isDragActive
          ? {
              bg: "secondary",
              borderRadius: "6px",
            }
          : {}),
      }}
    >
      <Flex
        as="form"
        sx={{
          ...sharedFlexSx,
          ...(isVisible || isDragActive
            ? {
                borderRadius: "4px",
                border: isDragActive
                  ? "1px dashed #6E56CF"
                  : "1px dashed #DCDBDD",
              }
            : {
                border: "1px solid transparent",
              }),
        }}
        onDragEnter={createHandleDrag(true)}
        onDragLeave={createHandleDrag(false)}
        onDragOver={createHandleDrag(true)}
        onSubmit={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {typeof children === "function" ? children({ isDragActive }) : children}
      </Flex>
    </Flex>
  );
};

export default DropZone;
