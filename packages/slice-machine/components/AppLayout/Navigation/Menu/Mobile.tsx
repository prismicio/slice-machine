import { useState } from "react";
import { Box, Button, Flex } from "theme-ui";

import Burger from "../Icons/Burger";
import VersionBadge from "../../Navigation/Badge";

import Logo from "./Logo";
import ItemsList from "./Navigation/List";

import { LinkProps } from "..";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getUpdateVersionInfo } from "@src/modules/environment";

const Mobile: React.FunctionComponent<{ links: LinkProps[] }> = ({ links }) => {
  const { updateVersionInfo } = useSelector((store: SliceMachineStoreType) => ({
    updateVersionInfo: getUpdateVersionInfo(store),
  }));

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
          <Box sx={{ textAlign: "right" }}>
            <VersionBadge version={updateVersionInfo.currentVersion} />
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export default Mobile;
