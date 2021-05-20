import { Flex } from 'theme-ui'
import { forwardRef } from 'react'

const Li = forwardRef(({ children, Component = Flex, sx = {}, ...rest }: { children: any, Component: any, sx: any }, ref) => (
  <Component
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
  </Component>
))

export default Li