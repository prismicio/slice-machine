import { CustomTypeState } from '../../../models/ui/CustomTypeState'

import { Box, Button, Heading, Flex } from 'theme-ui'

import FlexWrapper from './FlexWrapper'

const Header = ({ Model }: { Model: CustomTypeState }) => {
  return (
    <Box sx={{ bg: 'backgroundClear' }}>
      <FlexWrapper
        sx={{
          px: 3,
          py: 4,
        }}
      >

        <Box
          as="section"
          sx={{
            flexGrow: 99999,
            flexBasis: 0,
            minWidth: 320,
          }}
        >
          <Heading>Templates/{Model.label}</Heading>
        </Box>
        <Button>Push to Prismic</Button>
      </FlexWrapper>
    </Box>
  )
}

export default Header
