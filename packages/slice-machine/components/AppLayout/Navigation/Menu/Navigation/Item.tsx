import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Box, Link as ThemeLink } from "theme-ui";
import type { LinkProps } from "../../";

export interface ItemProps {
  link: LinkProps;
  theme?: "emphasis";
  "data-for"?: string;
  "data-tip"?: string;
  "data-testid"?: string;
  onClick?: () => void;
}

//const Item: React.FC<ItemProps> = ({ link, theme, ...rest }) => {
const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ link, theme, onClick, ...rest }, ref) => {
    const router = useRouter();
    return (
      <Box {...rest} ref={ref} as="li" key={link.title}>
        <Link href={link.href} passHref>
          <ThemeLink
            variant={
              theme === "emphasis" ? "links.sidebarEmphasis" : "links.sidebar"
            }
            sx={{
              display: "flex",
              alignItems: "center",
              mb: "10px",
              ...(link.match(router.asPath)
                ? {
                    color: "text",
                    bg: "#E6E6EA",
                  }
                : {}),
            }}
            target={link.target}
            onClick={onClick}
          >
            <link.Icon size={24} />
            <Box as="span" sx={{ ml: 2, fontWeight: 400 }}>
              {link.title}
            </Box>
          </ThemeLink>
        </Link>
      </Box>
    );
  }
);

export default Item;
