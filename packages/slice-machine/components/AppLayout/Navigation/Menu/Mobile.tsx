import { useState } from "react";
import { Box, Button, Flex } from "theme-ui";
import Burger from "components/AppLayout/Navigation/Icons/Burger";
import VersionBadge from "components/AppLayout/Navigation/Badge";
import Logo from "components/AppLayout/Navigation/Menu/Logo";
import ItemsList from "./Navigation/List";
import Environment from "lib/models/common/Environment";
import { LinkProps } from "./Navigation/Item";

const Mobile = ({ env, links }: { links: LinkProps[]; env: Environment }) => {
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <Box py={4} px={3} as="nav" bg="sidebar">
      <Flex sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Logo />
        <Button onClick={handleClick} variant="transparent">
          <Burger open={open} />
        </Button>
      </Flex>
      {open ? (
        <Box>
          <ItemsList mt={4} links={links} />
          <VersionBadge label="Version" version={env.currentVersion} />
        </Box>
      ) : null}
    </Box>
  );
};

export default Mobile;
