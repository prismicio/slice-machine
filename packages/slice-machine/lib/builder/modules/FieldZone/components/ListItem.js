import { Draggable } from 'react-beautiful-dnd'
import { MenuButton, Menu, MenuItem, MenuList } from '@reach/menu-button'

import {
  Flex,
  Text,
  theme,
  useThemeUI
} from 'theme-ui'

import Li from 'components/Li'
import IconButton from 'components/IconButton'
import ItemHeader from 'components/ItemHeader'

import * as widgets from 'lib/widgets'

import { MdSettings } from "react-icons/md";
import { BsThreeDotsVertical } from 'react-icons/bs'

const ListItem = ({
  item,
  index,
  deleteItem,
  enterEditMode,
  modelFieldName
}) => {
  const { key } = item
  const { theme } = useThemeUI()
  const { config: { label }, type } = item.value
  if (!widgets[type].Meta) {
    return (
      <Li><Text>Field type "{type}" not supported</Text></Li>
    )
  }
  const { Meta: { icon: WidgetIcon } } = widgets[type]

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
              Icon={MdSettings}
              label="Edit slice field"
              sx={{ cursor: "pointer", color: theme.colors.icons }}
              onClick={() => enterEditMode([key, item.value], modelFieldName, index)}
            />
            <Menu>
              <MenuButton className="sliceMenuButton"
                style={{
                  padding: "0",
                  cursor: "pointer",
                  width: "32px",
                  height: "32px",
                  border: "none",
                  background: "transparent",
                  outline: "0",
                }}
              >
                <BsThreeDotsVertical size={20} color={theme.colors.icons} />
              </MenuButton>
              <MenuList style={{
                background: theme.colors.gray,
                border: '1px solid',
                borderRadius: '3px',
                borderColor: theme.colors.borders,
                outline: '0'
              }}>
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