import React, { memo, useRef, useState } from "react";
import {
  Button,
  Flex,
  Image,
  Label,
  Spinner,
  Text,
  ThemeUIStyleObject,
} from "theme-ui";
import { acceptedImagesTypes } from "@lib/consts";
import { MdInfoOutline } from "react-icons/md";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";

const MemoedImage = memo<{ src: string | undefined }>(({ src }) => (
  <Image src={src} alt="Preview image" />
));

interface ScreenshotPreviewProps {
  src?: string;
  screenshotProperties?: {
    isLoading: boolean;
    isDisabled: boolean;
    onScreenshot?: () => void;
    onCustomScreenshot?: (file: File) => void;
  };
  sx?: ThemeUIStyleObject;
}

export const ScreenshotPreview: React.FC<ScreenshotPreviewProps> = ({
  src,
  screenshotProperties,
  sx = { height: "290px" },
}) => {
  // states
  const [display, setDisplay] = useState(false);
  const { isCheckingSetup } = useSelector((state: SliceMachineStoreType) => ({
    isCheckingSetup: isLoading(state, LoadingKeysEnum.CHECK_SIMULATOR),
  }));

  // input ref
  const inputFile = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (inputFile?.current) {
      file &&
        screenshotProperties?.onCustomScreenshot &&
        screenshotProperties?.onCustomScreenshot(file);
      inputFile.current.value = "";
    }
  };

  return (
    <div>
      {screenshotProperties && (
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
      )}
      <Flex
        sx={{
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          backgroundImage: "url(/pattern.png)",
          backgroundColor: "headSection",
          backgroundRepeat: "repeat",
          backgroundSize: "20px",
          borderBottom: (t) => `1px solid ${t.colors?.borders as string}`,
          borderRadius: "4px 4px 0 0",
          ...sx,
        }}
        onMouseEnter={() => setDisplay(true)}
        onMouseLeave={() => setDisplay(false)}
      >
        {display && screenshotProperties && (
          <Flex
            sx={{
              width: "100%",
              height: "100%",
              position: "absolute",
              background: "rgba(0,0,0,.4)",
              alignItems: "center",
              justifyContent: "center",
              zIndex: "0",
            }}
          >
            {screenshotProperties.isLoading || isCheckingSetup ? (
              <Spinner />
            ) : (
              <Flex sx={{ flexDirection: "column" }}>
                {screenshotProperties.onScreenshot && (
                  <Button
                    sx={{ mb: 3 }}
                    onClick={screenshotProperties.onScreenshot}
                    disabled={screenshotProperties.isDisabled}
                    variant={
                      screenshotProperties.isDisabled ? "disabled" : "primary"
                    }
                  >
                    Take screenshot
                  </Button>
                )}
                {screenshotProperties.onCustomScreenshot && (
                  <Label
                    htmlFor="input-file"
                    variant="buttons.primary"
                    sx={{ p: 2, borderRadius: "4px" }}
                  >
                    Custom screenshot
                  </Label>
                )}
              </Flex>
            )}
          </Flex>
        )}
        {src ? (
          <MemoedImage src={src} />
        ) : (
          <Text
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <MdInfoOutline />
            You have no screenshot yet.
          </Text>
        )}
      </Flex>
    </div>
  );
};
