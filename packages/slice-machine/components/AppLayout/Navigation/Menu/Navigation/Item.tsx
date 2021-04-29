import Link from "next/link";
import { IconType } from "react-icons/lib";
import { Box, Link as ThemeLink } from "theme-ui";

export interface LinkProps {
  title: string;
  href: string;
  Icon: IconType;
}

const Item = ({ link }: { link: LinkProps }) => {
  return (
    <Box as="li" key={link.title}>
      <Link href={link.href} passHref>
        <ThemeLink
          variant="links.sidebar"
          sx={{
            display: "flex",
            alignItems: "center",
            mb: "10px",
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
