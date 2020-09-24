import { Flex } from 'theme-ui'

const FullPage = ({ children }) => (
  <Flex
    sx={{
      height: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    { children }
  </Flex>
)

export default FullPage
