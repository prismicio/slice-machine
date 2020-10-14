import { Container, Box, Heading, Button, Flex, Text } from 'theme-ui'
import Card from 'components/Card'
import Li from 'components/Li'

const ConfigErrors = ({ errors }) => (
  <Container mt={4}>
    <Box sx={{ textAlign: 'center' }}>
      <Heading>We found errors in your configuration file</Heading>
      <Text as="p" mt={1}>
        Some values of your "sm.json" file are wrong or could not be parsed correctly.
      </Text>
    </Box>
    <Card
      borderFooter
      bg="#FFF"
      footerSx={{ p: 2 }}
      bodySx={{ pt: 2, pb: 2, px: 2, bg: 'gray' }}
      sx={{ maxWidth: '600px', mt: 4, margin: '4em auto' }}
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
          <Heading as="h3">{Object.keys(errors).length} errors found</Heading>
        </Flex>
      )}
    >
      {
        Object.entries(errors).map(([key, value]) => (
          <Li Component={Box} key={key}>
            <Text mb={1}>-- On property <b>"{key}"</b></Text>
            <Text>{value.message}</Text>
            {
              value.run ? <Text mt={1}>Try running: <pre>{value.run}</pre></Text> : null
            }
            {
              value.do ? <Text mt={1}>Todo: {value.do}</Text> : null
            }
          </Li>
        ))
      }
    </Card>
  </Container>
)

export default ConfigErrors
