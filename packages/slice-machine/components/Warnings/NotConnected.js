import { Text, Flex, Heading } from 'theme-ui'

import Card from '../Card'

const NotConnected = () => (
  <Card
      bg="background"
      bodySx={{ p: 3 }}
      sx={{ maxWidth: '480px', m: 3, borderRadius: '0' }}
      Header={({ radius }) => (
        <Flex
          sx={{
            p: 3,
            bg: 'headSection',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            borderBottom: t => `1px solid ${t.colors.borders}`
          }}
        >
          <Heading as="h3">You're not logged in</Heading>
        </Flex>
      )}
    >
      <Text as="p">
        In order to push your slices to your Shared Slices bucket,
        you will need to be connected to Prismic.
        If you haven't already created a project, please <b>run the setup command</b> first:
        <Text as="pre" variant="pre">prismic sm --setup</Text>
        <Text mt={1}>👆 This needs to be done inside a valid Next/Nuxt project.</Text>
        <Text mt={3}><b>Otherwise, simply run:</b></Text>
        <Text as="pre" mt={1}>prismic login</Text>
      </Text>
    </Card>
)

export default NotConnected
