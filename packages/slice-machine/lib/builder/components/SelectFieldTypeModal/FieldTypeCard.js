import { Box, Heading, Text, Button } from 'theme-ui'

const FieldTypeCard = ({ title, description, onSelect }) => (
  <Box>
    <Heading>{title}</Heading>
    <Text as="p">{description}</Text>
    <Button onClick={onSelect}>add</Button>
  </Box>
)

export default FieldTypeCard