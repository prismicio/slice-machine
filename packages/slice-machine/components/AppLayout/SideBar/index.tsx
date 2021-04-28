import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link as ThemeLink,
  useThemeUI,
} from "theme-ui";
import useWindowsSize from "hooks/useWindowSize";
import Environment from "../../../lib/models/common/Environment";
import Prismic from "./prismic";
import Burger from "./burger";
import { FiFile } from "react-icons/fi";
import { FiBox } from "react-icons/fi";

const VersionBadge = ({ version }: { version: string }) => {
  return (
    <div>
      <Link href="/changelog" passHref>
        <Box
          as="span"
          sx={{
            cursor: "pointer",
            color: "textClear",
            opacity: "0.8",
            fontSize: "12px",
            position: "absolute",
            bottom: 3,
          }}
        >
          Prismic Studio - version {version}
        </Box>
      </Link>
    </div>
  );
};

const links = [
  {
    title: "Custom Types",
    href: "/",
    Icon: FiFile,
  },
  {
    title: "Slices",
    href: "/slices",
    Icon: FiBox,
  },
];

const Item = ({ link }: { link: any }) => {
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
const ItemsList = ({ mt }: { mt?: number }) => {
  return (
    <Box as="nav" marginTop={mt}>
      <Box as="ul">
        {links.map((link) => (
          <Item link={link} />
        ))}
      </Box>
    </Box>
  );
};

const Logo = ({ p }: { p?: number }) => {
  const { theme } = useThemeUI();
  return (
    <Box p={2}>
      <Link href="/" passHref>
        <ThemeLink variant="links.invisible">
          <Flex sx={{ alignItems: "center" }}>
            <Prismic fill={theme.colors?.text} />
            <Heading as="h5" sx={{ ml: 2 }}>
              Prismic Studio
            </Heading>
          </Flex>
        </ThemeLink>
      </Link>
    </Box>
  );
};

const Mobile = () => {
  const [show, setShow] = useState(false);

  const handleClick = () => {
    setShow(!show);
    alert(show);
  };
  return (
    <Box as="nav" bg="sidebar">
      <Flex
        sx={{ alignItems: "center", justifyContent: "space-between" }}
        py={4}
        px={3}
      >
        <Logo />
        <Button onClick={handleClick} variant="transparent">
          <Burger />
        </Button>
      </Flex>
    </Box>
  );
};

const Desktop = ({ env }: { env: Environment }) => {
  return (
    <Box as="aside" bg="sidebar" sx={{ minWidth: "260px" }}>
      <Box py="4" px="3">
        <Logo />
        <ItemsList mt={4} />
        <VersionBadge version={env.currentVersion} />
      </Box>
    </Box>
  );
};

const Navigation = ({ env }: { env: Environment }) => {
  const viewport = useWindowsSize();
  return (viewport.width as number) < 640 ? <Mobile /> : <Desktop env={env} />;
};

export default Navigation;
