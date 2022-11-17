import Link from "next/link";
import type { FC, ReactElement, ReactNode } from "react";
import {
  type ThemeUIStyleObject,
  Flex,
  Box,
  Link as ThemeLink,
} from "theme-ui";

type HeaderProps = {
  ActionButton?: ReactElement;
  MainBreadcrumb: ReactElement;
  SecondaryBreadcrumb?: ReactElement;
  breadrumbHref: string;
  children?: ReactNode;
  sx?: ThemeUIStyleObject;
};

const Header: FC<HeaderProps> = ({
  ActionButton,
  MainBreadcrumb,
  SecondaryBreadcrumb,
  breadrumbHref,
  children,
  sx,
}) => (
  <Flex sx={{ justifyContent: "space-between", alignItems: "start", ...sx }}>
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
      {children ? (
        <Flex mt={3} sx={{ alignItems: "center" }}>
          <Flex sx={{ alignItems: "center" }}>{children}</Flex>
        </Flex>
      ) : null}
    </Flex>
    {ActionButton ? ActionButton : null}
  </Flex>
);

export default Header;
