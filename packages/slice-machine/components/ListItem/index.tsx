import { Fragment } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { MenuButton, Menu, MenuItem, MenuList } from '@reach/menu-button'

import {
  Box,
  Flex,
  useThemeUI
} from 'theme-ui'

import Li from '../Li'
import IconButton from '../IconButton'
import ItemHeader from './Header'

import { AiOutlineEdit } from 'react-icons/ai'
import { BsThreeDotsVertical } from 'react-icons/bs'

import { FaBars } from 'react-icons/fa'

const ListItem = (props: any) => {
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
    widget,

    draggableId,

    onMouseDownDrag,
    onMouseUpDrag,

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
            // {...provided.dragHandleProps}
            {...provided.draggableProps}
            Component={Box}
            sx={{
              p: 0,
              mx: 0,
              my: 3,
            }}
          >
            <Flex sx={{ width: '100%' }}>
              <IconButton
                  label="Reorder slice field (drag and drop)"
                  Icon={FaBars}
                  color={theme.colors.icons}
                  mr={1}
                  mt={3}
                  onMouseDown={onMouseDownDrag}
                  onMouseUp={onMouseUpDrag}
                  {...provided.dragHandleProps}
                />
              <Box sx={{
                    bg: "headSection",
                    width: '100%',
                    border: (t) => `1px solid ${t.colors.borders}` }}>
                <Flex
                  sx={{
                    p: 3,
                    alignItems: "center",
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                
                <ItemHeader 
                  theme={theme}
                  text={config?.label || key}
                  sliceFieldName={renderFieldAccessor(key)}
                  WidgetIcon={widget.Meta.icon}
                />
                <Flex>
                  { CustomEditElements ? CustomEditElements : null }
                  {
                    CustomEditElement
                      ? CustomEditElement
                      :  (
                        <IconButton
                          size={22}
                          Icon={AiOutlineEdit}
                          label="Edit slice field"
                          sx={{ cursor: "pointer", color: theme.colors?.icons }}
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
                      <BsThreeDotsVertical
                        size={20}
                        color={theme.colors?.icons as string}
                        style={{ pointerEvents: 'none' }}
                      />
                    </MenuButton>
                    <MenuList style={{
                      background: theme.colors?.gray as string,
                      border: '1px solid',
                      borderRadius: '3px',
                      borderColor: theme.colors?.borders as string,
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
              { HintElement ? HintElement : null }
              </Box>
            </Flex>
            { children }
          </Li>
        </Fragment>
      )}
    </Draggable>
    </Fragment>
  );
}

export default ListItem