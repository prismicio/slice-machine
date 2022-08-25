import React, { Fragment, memo, useRef, useState } from "react";
import { Button, Flex, Image, Label, Spinner, Text } from "theme-ui";
import { acceptedImagesTypes } from "@lib/consts";
import { MdInfoOutline } from "react-icons/md";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";

const DefaultImage: React.FC<{ src: string | undefined }> = ({ src }) => (
  <Image src={src} alt="Preview image" />
);
const MemoedImage = memo(DefaultImage);

interface ImagePreviewProps {
  src?: string;
  onScreenshot: () => void;
  imageLoading: boolean;
  onHandleFile?: (file: File) => void;
  preventScreenshot: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  onScreenshot,
  imageLoading,
  onHandleFile,
  preventScreenshot,
}) => {
  const inputFile = useRef<HTMLInputElement>(null);
  const { isCheckingSetup } = useSelector((state: SliceMachineStoreType) => ({
    isCheckingSetup: isLoading(state, LoadingKeysEnum.CHECK_SIMULATOR),
  }));
  const [display, setDisplay] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (inputFile?.current) {
      file && onHandleFile && onHandleFile(file);
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
        {display || imageLoading || isCheckingSetup ? (
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
                  <Button
                    sx={{ mb: 3 }}
                    onClick={onScreenshot}
                    disabled={preventScreenshot}
                    variant={preventScreenshot ? "disabled" : "primary"}
                  >
                    Take screenshot
                  </Button>
                  {onHandleFile && (
                    <Label
                      htmlFor="input-file"
                      variant="buttons.primary"
                      sx={{ p: 2, borderRadius: "4px" }}
                    >
                      Custom screenshot
                    </Label>
                  )}
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
