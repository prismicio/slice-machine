import { useRouter } from 'next/router'
import { mutate } from 'swr'
import Container from 'components/Container'
import Li from 'components/Li'
import Card from 'components/Card'

import { Heading, Box, Flex, Button, Text } from 'theme-ui'
import { useEffect } from 'react'

const Migration = ({ migrations }) => {
  const router = useRouter()
  const migrate = () => {
    fetch(`/api/migrate`, {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',

      },
    }).then(() => {
      mutate('/api/libraries')
    }).catch(err => {
      console.error(err)
    })
  }

  useEffect(() => {
    if (!migrations.length) {
      router.replace('/')
    }
  })
  return (
    <Container>
      <Box sx={{ textAlign: 'center' }}>
        <Heading>We found slices to migrate</Heading>
        <Text as="p" mt={1}>Pushing changes to Prismic will not affect your current website</Text>
      </Box>
      <Card
        borderFooter
        bg="gray"
        footerSx={{ p: 2 }}
        bodySx={{ pt: 2, pb: 2, px: 4, bg: 'gray' }}
        sx={{ maxWidth: '600px', mt: 4, margin: '4em auto' }}
        Header={({ radius }) => (
          <Flex
            sx={{
              p: 3,
              pl: 4,
              bg: 'headSection',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
              borderBottom: t => `1px solid ${t.colors.borders}`
            }}
          >
           <Heading as="h3">{migrations.length} Slices found</Heading>
          </Flex>
        )}
        Footer={(
          <Flex sx={{ alignItems: 'space-between' }}>
            <Box sx={{ ml: 'auto' }} />
            <Button
              type="button"
              onClick={migrate}
            >
              Push update to Prismic
            </Button>
          </Flex>
        )}
      >
        {
          migrations.map((slice) => (
            <Li key={`${slice.from}-${slice.sliceName}`}>
              <Text>{ slice.sliceName } from library <b>{slice.from}</b></Text>
            </Li>
          ))
        }
      </Card>
    </Container>
  )
}

export default Migration