import Link from "next/link";
import { useEffect } from "react";
import { Box, Flex, Heading, Link as ThemeLink, useThemeUI } from "theme-ui";
import Prismic from "../Icons/Prismic";

const Logo = () => {
  const { theme, setColorMode } = useThemeUI();

  useEffect(() => {
    if(setColorMode) {
      //hotfix for previous color modes
      setColorMode('light')
    }
  }, [])
  return (
    <Box p={2}>
      <Link href="/" passHref>
        <ThemeLink variant="links.invisible">
          <Flex sx={{ alignItems: "center" }}>
            <Prismic fill={theme.colors?.text as string} />
            <Heading as="h5" sx={{ ml: 2 }}>
              Prismic Builder
            </Heading>
          </Flex>
        </ThemeLink>
      </Link>
    </Box>
  );
};

export default Logo;
