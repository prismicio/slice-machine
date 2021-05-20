import Link from "next/link";
import { Box, Flex, Heading, Link as ThemeLink, useThemeUI } from "theme-ui";
import Prismic from "components/AppLayout/Navigation/Icons/Prismic";

const Logo = () => {
  const { theme } = useThemeUI();
  return (
    <Box p={2}>
      <Link href="/" passHref>
        <ThemeLink variant="links.invisible">
          <Flex sx={{ alignItems: "center" }}>
            <Prismic fill={theme.colors?.text} />
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
