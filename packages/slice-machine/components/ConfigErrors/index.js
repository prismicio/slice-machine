import { Container, Box, Heading, Button, Flex, Text } from 'theme-ui'
import Card from 'components/Card'
import Li from 'components/Li'

const ConfigErrors = ({ errors }) => (
  <Card
    bg="background"
    bodySx={{ p: 3 }}
    Header={({ radius }) => (
      <Flex
        sx={{
          p: 3,
          alignItems: "center",
          justifyContent: "space-between",
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          borderBottom: (t) => `1px solid ${t.colors?.borders}`,
        }}
      >
        <Heading as="h3">Your sm.json file contains errors</Heading>
      </Flex>
    )}
  >
    {
      Object.entries(errors).map(([key, value]) => (
        <Li Component={Box} key={key} sx={{ m: 0, p: 1 }}>
          <Text>- <b>{key}</b></Text><br/>
          <Text>{value.message}</Text><br/>
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
