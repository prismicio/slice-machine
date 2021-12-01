import { memo } from "react";
import { Box, Button, Card as ThemeCard, Flex, Heading, Text } from "theme-ui";

import Card from "@components/Card";

import ImagePreview from "./components/ImagePreview";
import SliceState from "@models/ui/SliceState";
import { AsArray, Variation } from "@models/common/Variation";

const MemoizedImagePreview = memo(ImagePreview);

type SideBarProps = {
  Model: SliceState;
  variation: Variation<AsArray>;
  imageLoading: boolean;
  onScreenshot: () => void;
  onHandleFile: (file: any) => void;
  openSetupPreview: () => void;
};

const SideBar: React.FunctionComponent<SideBarProps> = ({
  Model,
  variation,
  imageLoading,
  onScreenshot,
  onHandleFile,
  openSetupPreview,
}) => {
  const {
    infos: { previewUrls },
  } = Model;

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
          src={
            previewUrls &&
            previewUrls[variation.id] &&
            previewUrls[variation.id].url
          }
          imageLoading={imageLoading}
          onScreenshot={onScreenshot}
          onHandleFile={onHandleFile}
          preventScreenshot={false}
        />
      </Card>
      <ThemeCard mt={3}>
        <Flex
          as="li"
          sx={{
            p: 3,
            borderBottom: "1px solid",
            borderColor: "borders",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
            position: "relative",
            cursor: "pointer",
          }}
          onClick={() => null}
        >
          <Box>
            <Heading as="h5" sx={{ color: "text", mb: 2 }}>
              Configure slice preview
            </Heading>
            <Text as="p" variant="xs" sx={{ mb: 2 }}>
              You can preview your slices and view changes instantly
            </Text>
            <Button variant={"small"} onClick={openSetupPreview}>
              Setup the preview
            </Button>
          </Box>
        </Flex>
      </ThemeCard>
    </Box>
  );
};

export default SideBar;
