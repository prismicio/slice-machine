import { Fragment } from 'react'
import Link from 'next/link'
import { Badge, Flex, Box, useThemeUI, useColorMode } from 'theme-ui'

import IconButton from '../IconButton'

import { VscColorMode } from 'react-icons/vsc'
import { AiOutlineWarning } from 'react-icons/ai'

const Warnings = ({ theme, warnings, onClick }) => (
  <Fragment>
    <IconButton
        Icon={AiOutlineWarning}
        label="Open warnings panel"
        sx={{ cursor: "pointer", color: theme.colors.icons }}
        onClick={onClick}
      />
    <Badge variant="circle" ml={-3} mt={-3}>{warnings}</Badge>
  </Fragment>
)

const NavBar = ({ as = 'header', sx = {}, children, warnings = 0, openPanel }) => {
  const { theme } = useThemeUI()
  const [colorMode, setColorMode] = useColorMode()

  return (
    <Flex
      as={as}
      sx={{
        alignItems: 'center',
        variant: 'styles.header',
        bg: 'deep',
        py: 2,
        px: 3,
        ...sx
      }}
    >
      { children }
      <Box sx={{ mx: 'auto' }} />
      {
        warnings > 0 ? (
          <Warnings theme={theme} warnings={warnings} onClick={openPanel} />
        ) : null
      }
      <IconButton
        Icon={VscColorMode}
        label="Color Mode"
        sx={{ cursor: "pointer", color: theme.colors.icons, ml: 1 }}
        onClick={e => { setColorMode(colorMode === 'default' ? 'dark' : 'default')}}
      />
    </Flex>
  )
}

export default NavBar