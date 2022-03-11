import React from "react";
import Link from "next/link";
import { Box, Flex, Heading, Link as ThemeLink, useThemeUI } from "theme-ui";
import SliceMachineLogo from "../Icons/SliceMachineLogo";

const Logo: React.FC = () => {
  const { theme } = useThemeUI();
  return (
    <Box p={2}>
      <Link href="/" passHref>
        <ThemeLink variant="links.invisible">
          <Flex sx={{ alignItems: "center" }}>
            <SliceMachineLogo
              width="32px"
              height="32px"
              fill={theme.colors?.text as string}
            />
            <Heading as="h5" sx={{ ml: 2 }}>
              Slice Machine
            </Heading>
          </Flex>
        </ThemeLink>
      </Link>
    </Box>
  );
};

export default Logo;
