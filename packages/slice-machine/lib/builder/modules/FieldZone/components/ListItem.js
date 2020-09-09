import { Draggable } from 'react-beautiful-dnd'
import { MenuButton, Menu, MenuItem, MenuList } from '@reach/menu-button'

import {
  Flex,
  useThemeUI
} from 'theme-ui'

import Li from 'components/Li'
import IconButton from 'components/IconButton'
import ItemHeader from 'components/ItemHeader'

import * as widgets from 'lib/widgets'

import { FaEdit } from 'react-icons/fa'

import { BsThreeDotsVertical } from 'react-icons/bs'

const ListItem = ({
  item,
  index,
  deleteItem,
  enterEditMode,
  modelFieldName
}) => {
  const { key } = item
  const { config: { label }, type } = item.value
  const { Meta: { icon: WidgetIcon } } = widgets[type]

  const { theme } = useThemeUI()
  return (
    <Draggable draggableId={key} index={index}>
      {(provided) => (
        <Li
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <ItemHeader
            theme={theme}
            text={label || key}
            sliceProperty={`slice.${modelFieldName}.${key}`}
            iconButtonProps={provided.dragHandleProps}
            WidgetIcon={WidgetIcon}
          />
          <Flex sx={{ alignItems: "center" }}>
            <IconButton
              Icon={FaEdit}
              label="Edit slice field"
              sx={{ cursor: "pointer", color: theme.colors.icons }}
              onClick={() => enterEditMode([key, item.value], modelFieldName, index)}
            />
            <Menu>
              <MenuButton
                style={{
                  padding: "0",
                  cursor: "pointer",
                  width: "36px",
                  height: "36px",
                  border: "none",
                  background: "transparent",
                }}
              >
                <BsThreeDotsVertical size={20} color={theme.colors.icons} />
              </MenuButton>
              <MenuList style={{ background: "#FFF" }}>
                <MenuItem
                  style={{ padding: "6px", cursor: "pointer" }}
                  onSelect={() => deleteItem(key)}
                >
                  Delete field
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Li>
      )}
    </Draggable>
  );
}

export default ListItem