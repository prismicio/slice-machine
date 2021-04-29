import { Box } from "theme-ui";
import { useContext } from "react";
import VersionBadge from "components/AppLayout/Navigation/Badge";
import ItemsList from "./Navigation/List";
import Logo from "components/AppLayout/Navigation/Menu/Logo";
import { NavCtx } from "..";

const Desktop = () => {
  const navCtx = useContext(NavCtx);
  return (
    <Box as="aside" bg="sidebar" sx={{ minWidth: "260px" }}>
      <Box py={4} px={3}>
        <Logo />
        <ItemsList mt={4} links={navCtx?.links as []} />
        <VersionBadge version={navCtx?.env?.currentVersion as string} />
      </Box>
    </Box>
  );
};

export default Desktop;
