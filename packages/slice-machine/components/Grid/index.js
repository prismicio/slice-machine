import { Box } from 'theme-ui'

const Grid = ({ children }) => (
  <Box
    as="ul"
    sx={{
      listStyle: 'none',
      display: 'grid',
      gridGap: 3,
      gridTemplateColumns: 'repeat(auto-fit, minmax(256px, 1fr))',
      m: 0,
      px: 0,
      py: 2,
    }}
  >
    { children }
  </Box>
)

export default Grid
