import React from "react";
import Link from "next/link";
import { Box, Flex, Heading, Link as ThemeLink, useThemeUI } from "theme-ui";
import Prismic from "../Icons/Prismic";

const Logo: React.FC = () => {
  const { theme } = useThemeUI();
  return (
    <Box p={2}>
      <Link href="/" passHref>
        <ThemeLink variant="links.invisible">
          <Flex sx={{ alignItems: "center" }}>
            <Prismic fill={theme.colors?.text as string} />
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
