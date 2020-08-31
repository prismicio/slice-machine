import { Flex } from 'theme-ui'
import { forwardRef } from 'react'

const Li = forwardRef(({ children, sx = {}, ...rest }, ref) => (
  <Flex
    as="li"
    sx={{
      p: 3,
      mx: 3,
      alignItems: "center",
      variant: "styles.listItem",
      ...sx
    }}
    ref={ref}
    {...rest}
  >
    { children }
  </Flex>
))

export default Li