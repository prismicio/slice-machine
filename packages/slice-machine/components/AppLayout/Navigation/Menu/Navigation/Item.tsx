import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Box, Link as ThemeLink } from "theme-ui";
import { LinkProps } from "components/AppLayout/Navigation";

interface itemProps {
  link: LinkProps;
  theme?: "emphasis";
}

const Item: React.FC<itemProps> = ({ link, theme }) => {
  const router = useRouter();
  return (
    <Box as="li" key={link.title}>
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
        >
          <link.Icon size={24} />
          <Box as="span" sx={{ ml: 2, fontWeight: 400 }}>
            {link.title}
          </Box>
        </ThemeLink>
      </Link>
    </Box>
  );
};

export default Item;
