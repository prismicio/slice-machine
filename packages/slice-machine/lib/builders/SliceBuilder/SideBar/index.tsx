import React, { memo } from "react";
import type Models from "@slicemachine/core/build/src/models";
import { Box, Button, Card as ThemeCard, Flex, Heading, Text } from "theme-ui";
import Link from "next/link";

import Card from "@components/Card";

import ImagePreview from "./components/ImagePreview";
import SliceState from "@lib/models/ui/SliceState";
import { useRouter } from "next/router";

const MemoizedImagePreview = memo(ImagePreview);

type SideBarProps = {
  Model: SliceState;
  variation: Models.VariationAsArray;
  imageLoading: boolean;
  isPreviewSetup: boolean;
  onScreenshot: () => void;
  onHandleFile: (file: any) => void;
  openSetupPreview: () => void;
};

const SideBar: React.FunctionComponent<SideBarProps> = ({
  Model,
  variation,
  imageLoading,
  isPreviewSetup,
  onScreenshot,
  onHandleFile,
  openSetupPreview,
}) => {
  const { screenshotUrls } = Model;

  const router = useRouter();

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
            screenshotUrls &&
            screenshotUrls[variation.id] &&
            screenshotUrls[variation.id].url
          }
          imageLoading={imageLoading}
          onScreenshot={onScreenshot}
          onHandleFile={onHandleFile}
          preventScreenshot={!isPreviewSetup}
        />
      </Card>
      {isPreviewSetup ? (
        <Link
          href={{
            pathname: `${router.pathname}/preview`,
            query: router.query,
          }}
          passHref
        >
          <a target={"_blank"}>
            <Button
              variant={"secondary"}
              sx={{ cursor: "pointer", width: "100%", mt: 3 }}
            >
              Open Slice Preview
            </Button>
          </a>
        </Link>
      ) : (
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
            }}
          >
            <Box>
              <Heading as="h5" sx={{ color: "text", mb: 2 }}>
                Configure slice preview
              </Heading>
              <Text as="p" variant="xs" sx={{ mb: 2 }}>
                You can preview your slices and view changes instantly
              </Text>
              <Button
                variant={"small"}
                sx={{ cursor: "pointer" }}
                onClick={openSetupPreview}
              >
                Setup the preview
              </Button>
            </Box>
          </Flex>
        </ThemeCard>
      )}
    </Box>
  );
};

export default SideBar;
