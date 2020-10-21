import { Flex, Box, Heading, Text } from 'theme-ui'

const Li = ({ Icon, title, description, bodySx, ...rest }) => (
  <Flex
    as="li"
    sx={{
      p: 3,
      borderBottom: '1px solid #F7F7F7',
      alignItems: "center",
      textDecoration: 'none',
      color: 'inherit'
    }}
    {...rest}
  >
    <Box mr={3}>
      <Icon />
    </Box>
    <Box sx={bodySx}>
      <Heading as="h5">{title}</Heading>
      <Text as="p" variant="xs">{description}</Text>
    </Box>
  </Flex>
);

export default Li