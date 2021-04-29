import { Box } from "theme-ui";
import VersionBadge from "components/AppLayout/Navigation/Badge";
import Environment from "lib/models/common/Environment";
import ItemsList from "./Navigation/List";
import Logo from "components/AppLayout/Navigation/Menu/Logo";

const Desktop = ({ env, links }: { env: Environment; links: any }) => {
  return (
    <Box as="aside" bg="sidebar" sx={{ minWidth: "260px" }}>
      <Box py="4" px="3">
        <Logo />
        <ItemsList mt={4} links={links} />
        <VersionBadge version={env.currentVersion} />
      </Box>
    </Box>
  );
};

export default Desktop;
