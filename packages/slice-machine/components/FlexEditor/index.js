import { Box } from 'theme-ui'

import Container from '../Container'

export default ({ children, SideBar }) => (
  <Box
    sx={{
      display: 'grid',
      gridGap: 4,
      gridTemplateColumns: [
        'auto',
        '1fr 1fr'
      ]
    }}
  >
  <Container as="main">{children}</Container>
  <SideBar />
</Box>
)