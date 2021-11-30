import { memo } from "react";
import { Box, Flex, Card as ThemeCard, Heading } from "theme-ui";

import Card from "components/Card/";

import Li from "./components/Li";
import ImagePreview from "./components/ImagePreview";

const MemoizedImagePreview = memo(ImagePreview);

const SideBar = ({
  Model,
  variation,
  warnings,
  openPanel,
  imageLoading,
  onScreenshot,
  onHandleFile,
}) => {
  const {
    infos: { previewUrls },
  } = Model;

  console.log("IMPLEMENT preventScreenshot");

  return (
    <Box
      sx={{
        pl: 3,
        flexGrow: 1,
        flexBasis: "sidebar",
      }}
    >
      <Card bg="headSection" bodySx={{ p: 0 }} footerSx={{ p: 0 }}>
        <MemoizedImagePreview
          src={previewUrls[variation.id] && previewUrls[variation.id].url}
          imageLoading={imageLoading}
          onScreenshot={onScreenshot}
          onHandleFile={onHandleFile}
          preventScreenshot={false}
        />
      </Card>
      <ThemeCard mt={3}>Card</ThemeCard>
    </Box>
  );
};

export default SideBar;
