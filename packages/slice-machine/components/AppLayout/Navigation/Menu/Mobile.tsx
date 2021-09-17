import { useContext, useState } from 'react'
import { Box, Button, Flex } from 'theme-ui'

import Burger from '../Icons/Burger'
import VersionBadge from '../../Navigation/Badge'

import Logo from './Logo'
import ItemsList from './Navigation/List'

import { NavCtx } from '..'

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
          <Box sx={{ textAlign: "right" }}>
            <VersionBadge version={navCtx?.env?.currentVersion as string} />
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export default Mobile;
