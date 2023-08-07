import React, { memo } from "react";
import { Flex, Image, Text, ThemeUIStyleObject } from "theme-ui";
import { MdInfoOutline } from "react-icons/md";

const MemoedImage = memo<{ src: string | undefined }>(({ src }) => (
  <Image src={src} alt="Preview image" sx={{ maxHeight: "100%" }} />
));

interface ScreenshotPreviewProps {
  src?: string;
  sx: { height: string | number } & ThemeUIStyleObject;
  hideMissingWarning?: boolean;
}

export const ScreenshotPreview: React.FC<ScreenshotPreviewProps> = ({
  hideMissingWarning = false,
  src,
  sx,
}) => {
  return (
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
        borderRadius: "4px",
        ...sx,
      }}
    >
      {hideMissingWarning ? null : (
        <>
          {src !== undefined ? (
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
        </>
      )}
    </Flex>
  );
};
