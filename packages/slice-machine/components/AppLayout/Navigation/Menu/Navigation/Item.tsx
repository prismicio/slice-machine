import Link from "next/link";
import { useRouter } from "next/router";
import { Box, Link as ThemeLink } from "theme-ui";
import { LinkProps } from "components/AppLayout/Navigation";

const Item = ({ link }: { link: LinkProps }) => {
  const router = useRouter();
  return (
    <Box as="li" key={link.title}>
      <Link href={link.href} passHref>
        <ThemeLink
          variant="links.sidebar"
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
        >
          <link.Icon size={22} />
          <Box as="span" sx={{ ml: 2, fontWeight: 400 }}>
            {link.title}
          </Box>
        </ThemeLink>
      </Link>
    </Box>
  );
};

export default Item;
