import { Box, Flex, Heading, Text, useThemeUI } from 'theme-ui'

const FieldTypeCard = ({ title, description, icon: WidgetIcon, onSelect }) => {
  const { theme } = useThemeUI()
  return (
    <Flex
      sx={{
        p: 2,
        my: 2,
        alignItems: 'center',
        cursor: 'pointer',
        border: ({ colors }) => `1px solid ${colors.borders}`,
      }}
      onClick={onSelect}
    >
      <WidgetIcon
        label={`Select field of type "${title}"`}
        style = {
          {
            ...theme.widgetIcons,
            borderRadius: '3px',
            background: '#EAEBFF',
            border: ({ colors }) => `1px solid ${colors.primary}`
          }
        }
        size={36}
      />
      <Box ml={1}>
        <Heading as="h4">{title}</Heading>
        <Text as="p">{description}</Text>
      </Box>
    </Flex>
)
}

export default FieldTypeCard