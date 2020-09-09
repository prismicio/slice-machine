import { default as RcDrawer } from 'rc-drawer'

import {
  Box,
  Text
} from 'theme-ui'

const Drawer = ({
  isOpen,
  push,
  onClose
}) => {
  return (
    <RcDrawer
      open={isOpen}
      onClose={onClose}
      placement="right"
      width="480"
    >
      <Box
        sx={{
          borderBottom: t => `1px solid ${t.colors.borders}`,
          p: 3
        }}
      >
        <Text as="p"><b>Save to Prismic</b></Text>
        <button onClick={push}>push</button>
      </Box>
      <Box p={4}>
        content here
      </Box>
    </RcDrawer>
  )
}

export default Drawer