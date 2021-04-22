import { Flex } from 'theme-ui'

const FlexWrapper = ({ children, sx }) => (
  <Flex
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      margin: '0 auto',
      maxWidth: 1224,
      mx: 'auto',
      ...sx

    }}
  >
    { children }
  </Flex>
)

export default FlexWrapper
