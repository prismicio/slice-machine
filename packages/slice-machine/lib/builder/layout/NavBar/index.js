import React from 'react'
import { useContext } from 'react'
import { useRouter } from 'next/router'
import { LibContext } from 'src/lib-context'
import { useColorMode } from 'theme-ui'

import Link from 'next/link'

import IconButton from 'components/IconButton'
import { VscColorMode } from "react-icons/vsc";

import {
  Box,
  Text,
  Select,
  Flex,
  useThemeUI,
  Link as ThemeLink,
} from 'theme-ui'

const NavBar = ({
  from,
  href
}) => {
  const { theme } = useThemeUI()
  const router = useRouter()
  const slices = useContext(LibContext).find(e => e[0] === from)[1]
  const [colorMode, setColorMode] = useColorMode()

  return (
    <Flex
      as="header"
      sx={{
        alignItems: 'center',
        variant: 'styles.header',
        bg: 'deep',
        p: 2
      }}
    >
      <Link href="/index" as="/" passHref>
        <ThemeLink
          to='/'
          sx={{
            variant: 'styles.navLink',
            p: 2,
            cursor: 'pointer',
            textDecoration: 'none'
          }}>
          <Text as="h4" sx={{ m: 0 }}>
            { from } library
          </Text>
        </ThemeLink>
      </Link>

      <Text as="h4" sx={{ m: 0, variant: 'styles.navLink', }}>
          /
      </Text>
      <Select
        sx={{ ml: 2, variant: 'styles.navLink', pl: 2, pr: 4, py: 0, bg: 'rgba(255, 255, 255, .1  )', border: 'none' }}
        onChange={e => location.href = `/${href}/${e.target.value}`}
        defaultValue={router.query.sliceName}
      >
        {
          slices.map(e => (
            <option key={e.sliceName}>{e.sliceName}</option>
          ))
        }
      </Select>

      <Box
      sx={{ mx: 'auto' }} />
      <IconButton
        Icon={VscColorMode}
        label="Color Mode"
        sx={{ cursor: "pointer", color: theme.colors.icons }}
        onClick={e => { setColorMode(colorMode === 'default' ? 'dark' : 'default')}}
      />

    </Flex>
  )
}

export default NavBar