import Link from "next/link";
import { Flex, Box, Link as ThemeLink } from "theme-ui";

const Header = ({
  ActionButton,
  MainBreadcrumb,
  SecondaryBreadcrumb,
  breadrumbHref,
  children,
  sx,
}: {
  ActionButton?: React.ReactElement;
  MainBreadcrumb: React.ReactElement;
  SecondaryBreadcrumb?: React.ReactElement;
  breadrumbHref: string;
  children?: React.ReactElement;
  sx?: any;
}) => (
  <Flex
    sx={{ justifyContent: "space-between", alignItems: "start", mb: 4, ...sx }}
  >
    <Flex sx={{ flexDirection: "column" }}>
      <Flex
        sx={{
          fontSize: SecondaryBreadcrumb ? [3, 2, 4] : 4,
          fontWeight: "heading",
          alignItems: "center",
        }}
      >
        <Link href={breadrumbHref} passHref>
          <ThemeLink variant="invisible">
            <Flex sx={{ alignItems: "center" }}>{MainBreadcrumb}</Flex>
          </ThemeLink>
        </Link>
        <Box sx={{ fontWeight: "thin" }} as="span">
          {SecondaryBreadcrumb ? SecondaryBreadcrumb : null}
        </Box>
      </Flex>
      <Flex mt={3} sx={{ alignItems: "center" }}>
        <Flex sx={{ alignItems: "center" }}>{children ? children : null}</Flex>
      </Flex>
    </Flex>
    {ActionButton ? ActionButton : null}
  </Flex>
);

export default Header;
