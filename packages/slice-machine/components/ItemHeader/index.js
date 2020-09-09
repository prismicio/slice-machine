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
      style={theme.widgetIcons}
    />
    <Text
      as="p"
      sx={{
        bg: "muted",
        py: 1,
        px: 2,
        border: `1px solid ${theme.colors.borders}`,
        borderRadius: "4px",
        fontSize: "16px",
      }}
    >
      { text }
    </Text>
    <Text
      as="p"
      sx={{
        fontSize: "16px",
        ml: 2,
      }}
    >
      { sliceProperty }
    </Text>
  </Flex>
)

export default ItemHeader