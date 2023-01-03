import NextLink from "next/link";
import { type FC, type ReactElement, useState } from "react";
import {
  type ThemeUIStyleObject,
  Flex,
  Box,
  Link as ThemeLink,
} from "theme-ui";

import { useElementSize } from "@src/hooks/useElementSize";

type HeaderProps = {
  link: {
    Element: ReactElement;
    href: string;
  };
  subtitle?: {
    Element: ReactElement;
    title: string;
  };
  Actions: ReactElement[];
  sx?: ThemeUIStyleObject;
};

const Header: FC<HeaderProps> = ({ link, subtitle, Actions, sx }) => {
  const [overflowing, setOverflowing] = useState(false);
  const subtitleRef = useElementSize<HTMLElement>(
    (_size, element) => {
      setOverflowing(!!subtitle && element.offsetWidth < element.scrollWidth);
    },
    [subtitle]
  );
  return (
    <Flex
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        gap: "24px",
        ...sx,
      }}
    >
      <Flex
        sx={{
          whiteSpace: "nowrap",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <NextLink href={link.href} passHref>
          <ThemeLink variant="invisible" sx={{ flexShrink: 0 }}>
            <Flex
              sx={{
                alignItems: "center",
                fontWeight: "heading",
                fontSize: 4,
                gap: "8px",
              }}
            >
              {link.Element}
            </Flex>
          </ThemeLink>
        </NextLink>

        {subtitle ? (
          <Box
            ref={subtitleRef}
            sx={{
              fontWeight: "thin",
              fontSize: 4,
              lineHeight: "heading",
              flexGrow: 1,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
            as="span"
            title={overflowing ? subtitle.title : undefined}
          >
            {subtitle.Element}
          </Box>
        ) : null}
      </Flex>
      <Flex
        sx={{
          flexShrink: 0,
          gap: "8px",
          alignItems: "center",
        }}
      >
        {Actions}
      </Flex>
    </Flex>
  );
};

export default Header;
