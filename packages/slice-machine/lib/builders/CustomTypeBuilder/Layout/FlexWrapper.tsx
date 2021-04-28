import { Flex } from 'theme-ui'

const FlexWrapper = ({ children, sx }: { children: any, sx: any }) => (
  <Flex
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      margin: '0 auto',
      maxWidth: 1224,
      mx: 'auto',
      px: 4,
      ...sx

    }}
  >
    { children }
  </Flex>
)

export default FlexWrapper
