import { Fragment } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { MenuButton, Menu, MenuItem, MenuList } from '@reach/menu-button'

// import { ConfigContext } from 'src/config-context'

import {
  Box,
  Flex,
  Text,
  useThemeUI
} from 'theme-ui'

import Li from '../Li'
import IconButton from '../IconButton'
import ItemHeader from './Header'

// import * as widgets from '../../lib/models/common/widgets'

import { AiOutlineEdit } from 'react-icons/ai'
import { BsThreeDotsVertical } from 'react-icons/bs'

// import Hint from './Hints'

// import { findWidgetByConfigOrType } from '../../../../utils'

const ListItem = (props) => {
  const {
    item,
    index,
    deleteItem,
    enterEditMode,
    modelFieldName,
    renderFieldAccessor,

    HintElement,

    CustomEditElement,
    CustomEditElements,

    // renderHintBase,
    // isRepeatable,
    // showHints,

    // framework,
    widget,

    draggableId,

    children
  } = props

  const { theme } = useThemeUI()
  const { key, value: { config } } = item

  return (
    <Fragment>
      <Draggable draggableId={draggableId} index={index}>
      {(provided) => (
        <Fragment>
          <Li
            ref={provided.innerRef}
            {...provided.draggableProps}
            Component={Box}
            sx={{ p: 0, mx: 0, my: 3 }}
          >
            <Flex sx={{ justifyContent: 'space-between', width: '100%', p: 3 }}>
              <ItemHeader 
                theme={theme}
                text={config?.label || key}
                sliceFieldName={renderFieldAccessor(key)}
                iconButtonProps={provided.dragHandleProps}
                WidgetIcon={widget.Meta.icon}
              />
              <Flex sx={{ alignItems: "center" }}>
                { CustomEditElements ? CustomEditElements : null }
                {
                  CustomEditElement
                    ? CustomEditElement
                    :  (
                      <IconButton
                        size={22}
                        Icon={AiOutlineEdit}
                        label="Edit slice field"
                        sx={{ cursor: "pointer", color: theme.colors.icons }}
                        onClick={() => enterEditMode([key, item.value], modelFieldName, index)}
                      />
                    )
                }
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
            {
              HintElement ? HintElement : null
            }
            {/* <Hint
              show={showHints}
              isRepeatable={isRepeatable}
              renderHintBase={renderHintBase}
              framework={framework}
              item={item}
              typeName={widget.CUSTOM_NAME || widget.TYPE_NAME}
            /> */}
          </Li>
        </Fragment>
      )}
    </Draggable>
      { children }
    </Fragment>
  );
}

export default ListItem