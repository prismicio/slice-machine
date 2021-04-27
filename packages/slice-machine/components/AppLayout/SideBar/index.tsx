import Link from 'next/link'
import { Box, Flex, Heading, Badge, Link as ThemeLink } from 'theme-ui'

import Environment from '../../../lib/models/common/Environment'

import Prismic from './prismic.svg'

import { RiPagesLine } from 'react-icons/ri'
import { ImPagebreak } from 'react-icons/im'

const VersionBadge = ({ version, sx }: { version: string, sx: any }) => {
  return (
    <div>
      <Link href="/changelog" passHref>
        <Badge sx={{ cursor: 'pointer', color: '#FFF', ...sx }}>{version}</Badge>
      </Link>
    </div>
  )
}

const links = [{
  title: 'Custom Types',
  href: '/',
  Icon: RiPagesLine
}, {
  title: 'Slices',
  href: '/slices',
  Icon: ImPagebreak,
  sx: { ml: '-3px' }
}]

const SideBar = ({ env }: { env: Environment }) => {
  return (
    <Box
      as="aside"
      sx={{
        flexGrow: 1,
        flexBasis: 'leftSidebar',
        p: 3
      }}>
        <Link href="/" passHref>
          <ThemeLink variant="links.invisible">
            <Flex sx={{ alignItems: 'center' }}>
              <Prismic />&nbsp;<Heading as="h4">SliceMachine</Heading>
            </Flex>
          </ThemeLink>
        </Link>
        <VersionBadge version={env.currentVersion} sx={{ mt: 3 }} />
        <Box mt={4}>
          <ul>
            {
              links.map(link => (
                <li key={link.title}>
                  <Link href={link.href} passHref>
                    <ThemeLink variant="links.invisible" sx={{ display: 'flex', alignItems: 'center', mb: 3, ...link.sx }}>
                      <link.Icon size={22}/>&nbsp;{ link.title }
                    </ThemeLink>
                  </Link>
                </li>
              ))
            }
          </ul>
        </Box>
    </Box>
  )
}

export default SideBar
