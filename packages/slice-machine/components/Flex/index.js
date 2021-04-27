import { Box } from 'theme-ui'

export const Flex = ({ children, sx, ...rest }) => (
  <Box
    sx={{
      display: ['block', 'block', 'flex'],
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      ...sx
    }}
    {...rest}
  >
    { children }
  </Box>
)

export const Col = ({ children, cols = 2 }) => (
  <Box sx={{ flex: `0 ${100 / cols - 1}%`, mb: 1 }}>
    { children }
  </Box>
)