import { Box, Flex, Heading, Text, useThemeUI } from 'theme-ui'

const FieldTypeCard = ({ title, description, icon: WidgetIcon, onSelect }) => {
  const { theme } = useThemeUI()
  return (
    <Flex
      sx={{
        p: 3,
        my: 2,
        alignItems: 'center',
        cursor: 'pointer',
        borderRadius: '3px',
        border: ({ colors }) => `1px solid ${colors.borders}`,
        '&:hover': {
          border: ({ colors }) => `1px solid ${colors.primary}`,
          boxShadow: '0 0 8px rgba(0, 0, 0, 0.125)'
        }
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
            border: '2px solid'
          }
        }
        size={36}
      />
      <Box ml={1}>
        <Heading as="h4" sx={{ fontSize: 1 }} ><b>{title}</b></Heading>
        <Text as="p" variant="xs">{description}</Text>
      </Box>
    </Flex>
)
}

export default FieldTypeCard