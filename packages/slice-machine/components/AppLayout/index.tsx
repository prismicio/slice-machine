import SideBar from './SideBar'
import { Box } from 'theme-ui'

import Environment from '../../lib/models/common/Environment'

const AppLayout = ({ children, env }: { children: any, env: Environment }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
      }}>
      <SideBar env={env} />
      <Box
        as="main"
        sx={{
          flexGrow: 99999,
          flexBasis: 0,
          minWidth: 320,
          minHeight: '100vh',
          bg: 'backgroundClear'
        }}>
        { children }
      </Box>
    </Box>
  )
}

export default AppLayout