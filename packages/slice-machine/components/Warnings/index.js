import { Box, Flex, Heading, useThemeUI } from 'theme-ui'
import { AiFillWarning } from 'react-icons/ai'
import NotConnected from './NotConnected'
import { StorybookNotInstalled, StorybookNotRunning, StorybookNotInManifest } from './Storybook'
import ConfigErrors from '../ConfigErrors'

import { warningStates } from 'src/consts'

const Renderers = {
  [warningStates.NOT_CONNECTED]: NotConnected,
  [warningStates.STORYBOOK_NOT_IN_MANIFEST]: StorybookNotInManifest,
  [warningStates.STORYBOOK_NOT_INSTALLED]: StorybookNotInstalled,
  [warningStates.STORYBOOK_NOT_RUNNING]: StorybookNotRunning,
}

const Warnings = ({ list, configErrors, priority }) => {
  const { theme } = useThemeUI()

  const orderedList = priority ? [priority, ...list.filter(e => e !== priority)] : list
  return (
    <Box bg="background" sx={{ minHeight: '100vh' }}>
      <Flex
        sx={{
          height: '57px',
          borderBottom: ({ colors }) => `1px solid ${colors.deep}`,
          p: 3,
          bg: 'deep'
        }}
      >
        <Heading as="h3" sx={{ display: 'flex', alignItems: 'center', color: '#FFF' }}>
          <AiFillWarning fill={theme.colors.primary} style={{ marginRight: '8px'}} /> Warnings
        </Heading>
      </Flex>
      <Box p={3} sx={{ overflow: 'auto' }}>
        {
          orderedList.map(type => {
            const Component = Renderers[type]
            console.log({ Component, type })
            return <Component key={type} />
          })
        }
        {
          Object.entries(configErrors).length ? <ConfigErrors errors={configErrors} /> : null
        }
      </Box>
    </Box>
  )
}

export default Warnings
