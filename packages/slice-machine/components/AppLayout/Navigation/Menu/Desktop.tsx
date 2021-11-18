import { Box, Divider, Heading, Paragraph, Button, Flex } from "theme-ui";
import { useContext } from "react";
import { FiZap } from "react-icons/fi";
import VersionBadge from "../Badge";
import ItemsList from "./Navigation/List";
import Logo from "../Menu/Logo";
import { NavCtx } from "..";
import Item from "./Navigation/Item";

import NotLoggedIn from "./Navigation/NotLoggedIn";

import { warningStates } from "@lib/consts";

const warnings = (len: number) => ({
  title: `Warnings${len ? ` (${len})` : ""}`,
  delimiter: true,
  href: "/warnings",
  match(pathname: string) {
    return pathname.indexOf("/warnings") === 0;
  },
  Icon: FiZap,
});

const Desktop = () => {
  const navCtx = useContext(NavCtx);

  const isNotLoggedIn = !!(navCtx?.warnings || []).find(
    (e) => e.key === warningStates.NOT_CONNECTED
  );

  return (
    <Box as="aside" bg="sidebar" sx={{ minWidth: "260px" }}>
      <Box py={4} px={3}>
        <Logo />
        <ItemsList mt={4} links={navCtx?.links as []} />
        <Box sx={{ position: "absolute", bottom: "3" }}>
          <Flex
            sx={{
              maxWidth: "230px",
              border: "1px solid #E6E6EA",
              padding: "8px",
              flexDirection: "column",
            }}
          >
            <Heading
              as="h6"
              sx={{
                fontSize: "14px",
                margin: "8px",
              }}
            >
              Update Available
            </Heading>
            <Paragraph
              sx={{
                fontSize: "14px",
                color: "#4E4E55",
                margin: "8px",
              }}
            >
              A new version of Slice Machine is available
            </Paragraph>
            <Button
              sx={{
                background: "#5B3DF5",
                border: "1px solid rgba(62, 62, 72, 0.15)",
                boxSizing: "border-box",
                borderRadius: "4px",
                margin: "8px",
                fontSize: "11.67px",
              }}
              onClick={function openModal() {}}
            >
              Update
            </Button>
          </Flex>
          {isNotLoggedIn && <NotLoggedIn />}
          <Divider variant="sidebar" />
          <Item
            link={warnings(
              (navCtx?.warnings?.length || 0) +
                Object.keys(navCtx?.configErrors || {}).length
            )}
          />
          <VersionBadge
            label="Version"
            version={navCtx?.env?.currentVersion as string}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Desktop;
