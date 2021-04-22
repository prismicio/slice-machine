import { Fragment } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { MenuButton, Menu, MenuItem, MenuList } from '@reach/menu-button'
import { useContext } from 'react'
import { ConfigContext } from 'src/config-context'

import {
  Box,
  Flex,
  Text,
  useThemeUI
} from 'theme-ui'

import Li from '../../../../../../components/Li'
import IconButton from '../../../../../../components/IconButton'
import ItemHeader from '../../../../../../components/ItemHeader'

import * as widgets from '../../../../../models/common/widgets'

import { AiOutlineEdit } from 'react-icons/ai'
import { BsThreeDotsVertical } from 'react-icons/bs'

import Hint from './Hints'

import { findWidgetByConfigOrType } from '../../../../utils'

const ListItem = ({
  item,
  index,
  deleteItem,
  enterEditMode,
  modelFieldName,
  renderHintBase,
  renderFieldAccessor,
  isRepeatable,
  showHints,
}) => {
  const { key } = item
  const { theme } = useThemeUI()
  const { config, type } = item.value
  const { env: { framework } } = useContext(ConfigContext)

  const widget = findWidgetByConfigOrType(widgets, config, type)
  if (!widget) {
    return (
      <Li><Text>Field type "{type}" not supported</Text></Li>
    )
  }
  const { Meta: { icon: WidgetIcon }, CustomListItem } = widget

  if (CustomListItem) {
    return <CustomListItem value={item.value} />
  }

  return (
    <Draggable draggableId={key} index={index}>
      {(provided) => (
        <Fragment>
          <Li
          ref={provided.innerRef}
          {...provided.draggableProps}
          Component={Box}
          sx={{ p: 0 }}
        >
          <Flex sx={{ justifyContent: 'space-between', width: '100%', p: 3 }}>
            <ItemHeader 
              theme={theme}
              text={config.label || key}
              sliceFieldName={renderFieldAccessor(key)}
              iconButtonProps={provided.dragHandleProps}
              WidgetIcon={WidgetIcon}
            />
            <Flex sx={{ alignItems: "center" }}>
              <IconButton
                size={22}
                Icon={AiOutlineEdit}
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
          </Flex>
          <Hint
            show={showHints}
            isRepeatable={isRepeatable}
            renderHintBase={renderHintBase}
            framework={framework}
            item={item}
            typeName={widget.CUSTOM_NAME || widget.TYPE_NAME}
          />
        </Li>
        </Fragment>
      )}
    </Draggable>
  );
}

export default ListItem