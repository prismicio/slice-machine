import { memo, useState, useRef, Fragment } from "react";
import { Label, Flex, Image, Button, Text, Spinner } from "theme-ui";
import { acceptedImagesTypes } from "@lib/consts";
import InfoOutlined from "../icons/infoOutlined.svg";

const MemoedImage = memo(({ src }) => <Image src={src} alt="Preview image" />);

const ImagePreview = ({
  src,
  onScreenshot,
  imageLoading,
  onHandleFile,
  preventScreenshot,
}) => {
  const inputFile = useRef(null);
  const [display, setDisplay] = useState(false);

  const handleFile = (file) => {
    onHandleFile(file);
    inputFile.current.value = "";
  };

  return (
    <div>
      <input
        id="input-file"
        type="file"
        ref={inputFile}
        style={{ display: "none" }}
        accept={acceptedImagesTypes.map((type) => `image/${type}`).join(",")}
        onChange={(e) => handleFile(e.target.files[0])}
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
                  <Button
                    sx={{ mb: 3 }}
                    variant={preventScreenshot ? "disabled" : "primary"}
                    disabled={preventScreenshot}
                    onClick={onScreenshot}
                  >
                    Take screenshot
                  </Button>
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
            <InfoOutlined />
            You have no screenshot yet.
          </Text>
        )}
      </Flex>
    </div>
  );
};

export default ImagePreview;
