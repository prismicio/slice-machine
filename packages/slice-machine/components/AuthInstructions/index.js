import { Text, Flex, Heading } from 'theme-ui'
import FullPage from '../FullPage'

import Card from '../Card'

const AuthInstructions = () => (
  <FullPage>
    <Card
      borderFooter
      bg="#FFF"
      bodySx={{ p: 3 }}
      sx={{ maxWidth: '600px', mt: -4 }}
      Header={({ radius }) => (
        <Flex
          sx={{
            p: 3,
            pl: 4,
            bg: '#FFF',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            borderBottom: t => `1px solid ${t.colors.borders}`
          }}
        >
          <Heading as="h3">Login to Prismic</Heading>
        </Flex>
      )}
    >
      <Text as="p">
        In order to access your builder, you will need to be connected to Prismic.
        If you haven't already created a project, please <b>run the setup command</b> first:
        <Text mt={1}><pre>prismic sm --setup</pre></Text>
        <Text mt={1}>👆 This needs to be done inside a valid Next/Nuxt project.</Text>
        <Text mt={3}><b>Otherwise, simply run:</b></Text>
        <Text mt={1}><pre>prismic login</pre></Text>
      </Text>
    </Card>
  </FullPage>
)

export default AuthInstructions
