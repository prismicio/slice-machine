import Link from 'next/link'
import { Fragment, useContext } from 'react'
import { useRouter } from 'next/router'
import { Link as ThemeLink, Text, Select } from 'theme-ui'

import { SliceContext } from 'src/models/slice/context'
import { LibrariesContext } from 'src/models/libraries/context'
import NavBar from './'
import { VersionBadge } from './components'

const INDEX = 'INDEX'
const LIB = 'LIB'

const Routes = {
  '/index': INDEX,
  '/[lib]/[sliceName]': LIB
}

const InBuilder = ({ router, ...props }) => {
  const { Model } = useContext(SliceContext)
  const slices = useContext(LibrariesContext).find(e => e[0] === Model.from)[1]
  return (
    <NavBar {...props} {...Model}>
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
            { Model.from } library
          </Text>
        </ThemeLink>
      </Link>

      <Text as="h4" sx={{ m: 0, variant: 'styles.navLink', }}>
          /
      </Text>
      <Select
        sx={{ ml: 2, variant: 'styles.navLink', pl: 2, pr: 4, py: 0, bg: 'rgba(255, 255, 255, .1  )', border: 'none' }}
        onChange={e => location.href = `/${Model.href}/${e.target.value}`}
        defaultValue={Model.sliceName}
      >
        {
          slices.map(([e]) => (
            <option key={e.sliceName}>{e.sliceName}</option>
          ))
        }
      </Select>
    </NavBar>
  )
}
const WithRouter = (props) => {
  const router = useRouter()
  const route = Routes[router.route] || INDEX
  return route === INDEX ? (
    <NavBar {...props}>
      <Fragment>
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
              Slice Machine
            </Text>
          </ThemeLink>
        </Link>
        <VersionBadge version={props.env.currentVersion} />
      </Fragment>
    </NavBar>
  ) : (
    <InBuilder router={router} {...props} />
  )
}

export default WithRouter
