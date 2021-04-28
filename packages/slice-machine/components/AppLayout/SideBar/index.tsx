import Link from 'next/link'
import { Box, Flex, Heading, Badge, Link as ThemeLink } from 'theme-ui'

import Environment from '../../../lib/models/common/Environment'

import Prismic from './prismic.svg'

import { FiFile } from 'react-icons/fi'
import { FiBox } from 'react-icons/fi'

const VersionBadge = ({ version, sx }: { version: string, sx: any }) => {
  return (
    <div>
      <Link href="/changelog" passHref>
        <Box as="span" sx={{ cursor: 'pointer', color: 'textClear', opacity: '0.8', fontSize: '12px', position: 'absolute', bottom: 0 }}>Prismic Studio - version {version}</Box>
      </Link>
    </div>
  )
}

const links = [{
  title: 'Custom Types',
  href: '/',
  Icon: FiFile
}, {
  title: 'Slices',
  href: '/slices',
  Icon: FiBox
}]

const SideBar = ({ env }: { env: Environment }) => {
  return (
    <Box
      as="aside"
      sx={{
        // flexGrow: 1,
        // flexBasis: 'leftSidebar',
        width: '260px',
        pl: 3,
        pr: 3,
        pt: 4,
        pb: 4,
      }}>
      <Box
        as="div"
        sx={{
          height: '100%',
          maxHeight: 'calc(100vh - 2em * 2)',
          position: 'sticky',
          top: '32px',
          top: 4
        }}>
        <Link href="/" passHref>
          <ThemeLink variant="links.invisible">
            <Flex sx={{ alignItems: 'center', pl: 2 }}>
              <Prismic /><Heading as="h5" sx={{ml:2}}>Prismic Studio</Heading>
            </Flex>
          </ThemeLink>
        </Link>
        <Box mt={4}>
          <ul>
            {
              links.map(link => (
                <li key={link.title}>
                  <Link href={link.href} passHref>
                    <ThemeLink variant="links.sidebar" sx={{ display: 'flex', alignItems: 'center', mb: '10px', ...link.sx }}>
                      <link.Icon size={22}/>
                      <Box as="span" sx={{ml: 2, fontWeight: 400}}>{ link.title }</Box>
                    </ThemeLink>
                  </Link>
                </li>
              ))
            }
          </ul>
        </Box>
        <VersionBadge version={env.currentVersion} />
      </Box>
    </Box>
  )
}

export default SideBar
