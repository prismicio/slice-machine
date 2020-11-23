import { Box, Flex, Heading, useThemeUI } from 'theme-ui'
import { AiFillWarning } from 'react-icons/ai'
import { NewVersionAvailable, ClientError, NotConnected } from './Errors'
import { StorybookNotInstalled, StorybookNotRunning, StorybookNotInManifest } from './Storybook'
import ConfigErrors from '../ConfigErrors'

import { warningStates } from 'src/consts'

const Renderers = {
  [warningStates.NOT_CONNECTED]: NotConnected,
  [warningStates.STORYBOOK_NOT_IN_MANIFEST]: StorybookNotInManifest,
  [warningStates.STORYBOOK_NOT_INSTALLED]: StorybookNotInstalled,
  [warningStates.STORYBOOK_NOT_RUNNING]: StorybookNotRunning,
  [warningStates.CLIENT_ERROR]: ClientError,
  [warningStates.NEW_VERSION_AVAILABLE]: NewVersionAvailable
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
          orderedList.map(typeOrTuple => {
            const [type, payload] = Array.isArray(typeOrTuple) ? typeOrTuple : [typeOrTuple, null]
            const [errorName, errorType] = type.split(':')
            const Component = Renderers[errorName]
            return <Component key={type} errorType={errorType} {...payload} />
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
