import { Box } from 'theme-ui'

export const Flex = ({ children }) => (
  <Box
    sx={{
      display: ['block', 'block', 'flex'],
      flexWrap: 'wrap',
      justifyContent: 'space-between'
    }}
  >
    { children }
  </Box>
)

export const Col = ({ children }) => (
  <Box sx={{ flex: '0 49%', mb: 1 }}>
    { children }
  </Box>
)