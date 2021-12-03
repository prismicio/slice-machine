import { memo } from "react";
import Link from "next/link";
import { Box, Flex, Card as ThemeCard, Heading } from "theme-ui";

import Card from "components/Card/";

import Li from "./components/Li";
import ImagePreview from "./components/ImagePreview";

import * as Links from "@builders/SliceBuilder/links";

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
  const { screenshotUrls } = Model;

  console.log("IMPLEMENT preventScreenshot", variation, Model);

  const { as, href } = Links.variation({
    lib: Model.href,
    sliceName: Model.infos.sliceName,
    variationId: variation.id,
    isPreview: true,
  });

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
          src={screenshotUrls[variation.id] && screenshotUrls[variation.id].url}
          imageLoading={imageLoading}
          onScreenshot={onScreenshot}
          onHandleFile={onHandleFile}
          preventScreenshot={false}
        />
      </Card>
      <ThemeCard mt={3}>
        <Link as={as} href={href} passHref>
          <a target="_blank">Open Preview</a>
        </Link>
      </ThemeCard>
    </Box>
  );
};

export default SideBar;
