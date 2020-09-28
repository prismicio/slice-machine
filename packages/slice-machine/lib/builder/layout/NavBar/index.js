import { useContext } from 'react'
import { useRouter } from 'next/router'
import { LibContext } from 'src/lib-context'

import Link from 'next/link'

import {
  Text,
  Select,
  Flex,
  Link as ThemeLink,
} from 'theme-ui'

const NavBar = ({
  from,
}) => {

  const router = useRouter()
  const slices = useContext(LibContext).find(e => e[0] === from)[1]

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
        sx={{ ml: 2, variant: 'styles.navLink', pl: 2, pr: 4, py: 0, bg: 'rgba(255, 255, 255, .4)', border: 'none' }}
        onChange={e => location.href = `/${from}/${e.target.value}`}
        defaultValue={router.query.sliceName}
      >
        {
          slices.map(e => (
            <option key={e.sliceName}>{e.sliceName}</option>
          ))
        }
      </Select>
    </Flex>
  )
}

export default NavBar