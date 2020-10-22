import { Box } from "theme-ui";

export default ({ children, sx = {}, ...rest }) => (
  <Box
    sx={{
      maxWidth: 1224,
      mx: 'auto',
      px: 3,
      py: 4,
      ...sx
    }}
    {...rest}
  >
    { children }
  </Box>
)