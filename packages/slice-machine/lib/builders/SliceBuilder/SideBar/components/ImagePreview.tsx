import React, { memo, useState, useRef, Fragment } from "react";
import { Label, Flex, Image, Button, Text, Spinner } from "theme-ui";
import { acceptedImagesTypes } from "@lib/consts";
import { MdInfoOutline } from "react-icons/md";

const DefaultImage: React.FC<{ src: string | undefined }> = ({ src }) => (
  <Image src={src} alt="Preview image" />
);
const MemoedImage = memo(DefaultImage);

interface ImagePreviewProps {
  src?: string;
  onScreenshot: () => void;
  imageLoading: boolean;
  onHandleFile: (file: any) => void;
  preventScreenshot: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  onScreenshot,
  imageLoading,
  onHandleFile,
  preventScreenshot,
}) => {
  const inputFile = useRef<HTMLInputElement>(null);
  const [display, setDisplay] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (inputFile?.current) {
      onHandleFile(file);
      inputFile.current.value = "";
    }
  };

  return (
    <div>
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
      <Flex
        sx={{
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          height: "290px",
          overflow: "hidden",
          backgroundImage: "url(/pattern.png)",
          backgroundColor: "headSection",
          backgroundRepeat: "repeat",
          backgroundSize: "20px",
          border: "1px solid #C9D0D8",
          boxShadow: "0px 8px 14px rgba(0, 0, 0, 0.1)",
          borderRadius: "4px",
        }}
        onMouseEnter={() => setDisplay(true)}
        onMouseLeave={() => setDisplay(false)}
      >
        {display || imageLoading ? (
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
            {display ? (
              <Fragment>
                <Flex sx={{ flexDirection: "column" }}>
                  {!preventScreenshot ? (
                    <Button
                      sx={{ mb: 3 }}
                      variant="primary"
                      onClick={onScreenshot}
                    >
                      Take screenshot
                    </Button>
                  ) : null}
                  <Label
                    htmlFor="input-file"
                    variant="buttons.primary"
                    sx={{ p: 2, borderRadius: "4px" }}
                  >
                    Custom screenshot
                  </Label>
                </Flex>
              </Fragment>
            ) : (
              <Spinner />
            )}
          </Flex>
        ) : null}
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

export default ImagePreview;
