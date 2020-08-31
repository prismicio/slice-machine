import { useContext } from 'react'
import { ModelContext } from "src/model-context"

import {
  Heading,
  Text,
  Box,
  Button,
  Card,
  Image
} from 'theme-ui'

const borderBottom = '1px solid #F7F7F7'

const SideBar = ({
  onPush
}) => {
  const {
    meta: {
      fieldset: title,
      description
    },
    info,
  } = useContext(ModelContext)

  return (
    <Box
      sx={{
        pl: 3,
        flexGrow: 1,
        flexBasis: 'sidebar',
      }}
      as="aside"
      >
      <Box mb={3}>
        <Heading as="h2">
          {title}
        </Heading>
        <Text as="p">
          { description }
        </Text>
      </Box>
      <Box
      >
        <Card sx={{ border: '1px solid #F1F1F1', bg: '#FFF'}}>
          <Image src={info.previewUrl} p={2} />
          <ul>
            <Box as="li" sx={{ p: 2, borderBottom, }}>hi!</Box>
            <Box as="li" sx={{ p: 2, borderBottom, }}>hi!</Box>
            <Box as="li" sx={{ p: 2, borderBottom, }}>hi!</Box>
          </ul>
          < Button
            sx={{
              width: '100%',
              borderTopRightRadius: '0',
              borderTopLeftRadius: '0',
              cursor: 'pointer'
            }}
            onClick={onPush}
          >
            Push to Prismic
          </Button>
        </Card>
      </Box>
    </Box>
  )
}

export default SideBar