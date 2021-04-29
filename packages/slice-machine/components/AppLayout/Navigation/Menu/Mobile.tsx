import { useContext, useState } from "react";
import { Box, Button, Flex } from "theme-ui";
import Burger from "components/AppLayout/Navigation/Icons/Burger";
import VersionBadge from "components/AppLayout/Navigation/Badge";
import Logo from "components/AppLayout/Navigation/Menu/Logo";
import ItemsList from "./Navigation/List";
import { NavCtx } from "..";

const Mobile = () => {
  const navCtx = useContext(NavCtx);
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
          <ItemsList mt={4} links={navCtx?.links as []} />
          <VersionBadge version={navCtx?.env?.currentVersion as string} />
        </Box>
      ) : null}
    </Box>
  );
};

export default Mobile;
