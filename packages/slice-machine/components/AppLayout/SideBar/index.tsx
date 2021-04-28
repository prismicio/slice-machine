import Link from "next/link";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link as ThemeLink,
  SxStyleProp,
} from "theme-ui";
import useWindowsSize from "hooks/useWindowSize";

import Environment from "../../../lib/models/common/Environment";

import Prismic from "./prismic.svg";

import { FiFile } from "react-icons/fi";
import { FiBox } from "react-icons/fi";
import { useState } from "react";

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
const ItemsList = ({ sx }: { sx: SxStyleProp }) => {
  return (
    <Box as="nav" sx={sx}>
      <Box as="ul">
        {links.map((link) => (
          <Item link={link} />
        ))}
      </Box>
    </Box>
  );
};

const Logo = () => {
  return (
    <Box p={2}>
      <Link href="/" passHref>
        <ThemeLink variant="links.invisible">
          <Flex sx={{ alignItems: "center" }}>
            <Prismic />
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
  return (
    <Box as="nav" bg="sidebar">
      <Button onClick={() => setShow(!show)}>Show</Button>
      <Box>show {JSON.stringify(show)}</Box>
    </Box>
  );
};

const Desktop = ({ env }: { env: Environment }) => {
  return (
    <Box as="aside" bg="sidebar" sx={{ minWidth: "260px" }}>
      <Box py="4" px="3">
        <Logo />
        <ItemsList sx={{ mt: 4 }} />
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
