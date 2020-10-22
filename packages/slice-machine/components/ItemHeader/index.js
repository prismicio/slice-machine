import { Flex, Text } from 'theme-ui'

import IconButton from 'components/IconButton'
import { FaBars } from 'react-icons/fa'

const ItemHeader = ({
  text,
  sliceProperty,
  theme,
  WidgetIcon,
  iconButtonProps = {}
}) => (
  <Flex sx={{ alignItems: "center" }}>
    <IconButton
      label="Reorder slice field (drag and drop)"
      Icon={FaBars}
      color={theme.colors.icons}
      mr={1}
      {...iconButtonProps}
    />
    <WidgetIcon
      size={28}
      style={{
        color: theme.colors.primary,
        marginRight: '8px',
        borderRadius: '4px',
        padding: '4px',
        border: '2px solid',
        borderColor: theme.colors.primary,
      }}
    />
    <Text
      as="p"
      sx={{
        py: 0,
        px: 1,
        fontWeight: "label",
        fontSize: "15px",
      }}
    >
      { text }
    </Text>
    <Text
      as="p"
      sx={{
        fontSize: "14px",
        ml: 1,
        color: 'textClear',
      }}
    >
      { sliceProperty }
    </Text>
  </Flex>
)

export default ItemHeader