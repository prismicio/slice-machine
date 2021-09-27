import { Box, Divider } from "theme-ui";
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
