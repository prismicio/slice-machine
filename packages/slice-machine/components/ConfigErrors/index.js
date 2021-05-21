import { Container, Box, Heading, Button, Flex, Text } from 'theme-ui'
import Card from 'components/Card'
import Li from 'components/Li'

const ConfigErrors = ({ errors }) => (
  <Card
    borderFooter
    bg="gray"
    footerSx={{ p: 2 }}
    bodySx={{ pt: 2, pb: 2, px: 2, bg: 'gray' }}
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
          borderBottom: t => `1px solid ${t.colors?.borders}`
        }}
      >
        <Heading as="h3">Your sm.json file contains errors</Heading>
      </Flex>
    )}
  >
    {
      Object.entries(errors).map(([key, value]) => (
        <Li Component={Box} key={key}>
          <Text>- <b>{key}</b></Text>
          <Text>{value.message}</Text>
          {
            value.run ? <Text mt={1}>Try running: <Text variant="pre">{value.run}</Text></Text> : null
          }
          {
            value.do ? <Text mt={1}>Todo: {value.do}</Text> : null
          }
        </Li>
      ))
    }
  </Card>
)

export default ConfigErrors
