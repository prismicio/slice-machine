import Link from 'next/link'
import { Fragment, useContext } from 'react'
import { useRouter } from 'next/router'
import { Link as ThemeLink, Text, Select } from 'theme-ui'

import { SliceContext } from 'src/models/slice/context'
import { LibrariesContext } from 'src/models/libraries/context'
import NavBar from './'
import { VersionBadge } from './components'
import SliceState from 'lib/models/ui/SliceState'
import * as Links from 'lib/builder/links'

const INDEX = 'INDEX'
const LIB = 'LIB'
const VARIATION = 'VARIATION'

const Routes = {
  '/': INDEX,
  '/[lib]/[sliceName]': LIB,
  '/[lib]/[sliceName]/[variation]': VARIATION
}

const InBuilder = ({ router, ...props }) => {
  const { Model, variation } = useContext(SliceContext)
  const libs = useContext(LibrariesContext)
  const slices = libs.find(lib => lib.name === Model.from)?.components || []
  return (
    <NavBar {...props} {...Model}>
      <Link href="/" passHref>
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
        onChange={e => {
          const defaultVariation = SliceState.variation(Model)
          if(defaultVariation) {
            router.push(...Links.variation(Model.href, e.target.value, defaultVariation.id).all)
          }
        }}
        defaultValue={Model.infos.sliceName}
      >
        {
          slices.map(([e]) => (
            <option key={e.infos.sliceName}>{e.infos.sliceName}</option>
          ))
        }
      </Select>
    </NavBar>
  )
}
const WithRouter = (props) => {
  const router = useRouter()
  console.log({ route: router.route })

  const route = Routes[router.route] || INDEX
  return route === INDEX ? (
    <NavBar {...props}>
      <Fragment>
        <Link href="/" passHref>
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
