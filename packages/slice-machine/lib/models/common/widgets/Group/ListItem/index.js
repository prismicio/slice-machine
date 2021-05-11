import { Fragment, useState } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { MenuButton, Menu, MenuItem, MenuList } from '@reach/menu-button'
import { useContext } from 'react'
import { ConfigContext } from 'src/config-context'

import { removeKeys } from 'lib/utils'

import { DragDropContext, Droppable } from 'react-beautiful-dnd'


import {
  Box,
  Flex,
  Text,
  Button,
  useThemeUI
} from 'theme-ui'

import SelectFieldTypeModal from 'lib/builders/common/SelectFieldTypeModal'
import NewField from 'lib/builders/common/Zone/Card/components/NewField'

import { findWidgetByConfigOrType } from '../../../../../builders/utils'
// import { sliceBuilderWidgetsArray } from 'lib/models/common/widgets/asArray'


import Li from '../../../../../../components/Li'
import IconButton from '../../../../../../components/IconButton'
import ItemHeader from '../../../../../../components/ItemHeader'

import * as Widgets from '../../../widgets'

import { AiOutlineEdit } from 'react-icons/ai'
import { BsThreeDotsVertical } from 'react-icons/bs'

import ListItem from 'components/ListItem'

const CustomListItem = ({
  item,
  widget,
  snapshot,
  renderFieldAccessor,
  ...rest
}) => {


  const { theme } = useThemeUI()
  const [selectMode, setSelectMode] = useState(false)
  const [newFieldData, setNewFieldData] = useState(null)

  const onSelectFieldType = (widgetTypeName) => {
    setNewFieldData({ widgetTypeName })
    setSelectMode(false)
  }

  const onCancelNewField = () => {
    setNewFieldData(null)
  }

  const onSaveNewField = ({ id, widgetTypeName }, helpers) => {
    store
      .tab(tabId)
      .group(item.key)
      .addWidget(id, {
        type: widget.TYPE_NAME,
        [widget.customAccessor || 'config']: removeKeys(widget.create(id), ['id'])
      })
  }

  const onDragEnd = (result) => {
    if (!result.destination) {
      return
    }
    if (result.source.droppableId !== result.destination.droppableId) {
      return
    }
    store.tab(tabId).group(item.key).reorderWidget(result.source.index, result.destination.index)
  }

  return (
    <Fragment>
      <ListItem
        item={item}
        widget={widget}
        renderFieldAccessor={renderFieldAccessor}
        {...rest}
        children={(
          <Box sx={{ ml: 4 }}>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={"my-unique-id"}>
                  {(provided) => !snapshot.isDragging && (
                    <ul ref={provided.innerRef} {...provided.droppableProps}>
                      {
                        item.value.fields.map((item, index) => {
                          const { value: { config, type } } = item
                          const widget = findWidgetByConfigOrType(Widgets, config, type)
                          if (!widget) {
                            return (
                              <Li><Text>Field type "{type}" not supported</Text></Li>
                            )
                          }

                          console.log({
                            renderFieldAccessor
                          })

                          const props = {
                            item,
                            index,
                            widget,
                            snapshot,
                            key: item.key,
                            renderFieldAccessor,
                            // enterEditMode,
                            // deleteItem: onDeleteItem,
                            draggableId: `list-item-${item.key}-${index}`,
                          }

                          if (widget.CustomListItem) {
                            const { CustomListItem } = widget
                            return (
                              <CustomListItem {...props} />
                            )
                          }

                          // const HintElement = (
                          //   <Hint
                          //     item={item}
                          //     show={showHints}
                          //     isRepeatable={isRepeatable}
                          //     renderHintBase={renderHintBase}
                          //     framework={framework}
                          //     typeName={widget.CUSTOM_NAME || widget.TYPE_NAME}
                          //   />
                          // )
                          return (
                            <ListItem
                              {...props}
                              // HintElement={HintElement}
                            />
                          )
                        })
                      }

                      {
                        newFieldData && (
                          <NewField
                            {...newFieldData}
                            // fields={poolOfFieldsToCheck || fields}
                            fields={[]}
                            onSave={(...args) => {
                              onSaveNewField(...args)
                              setNewFieldData(null)
                            }}
                            onCancelNewField={onCancelNewField}
                          />
                        )
                      }
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
          </Box>
        )}
      />
      {/* <Draggable draggableId={item.key} index={index}>
        {(provided, snapshot) => (
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
                text={item.key}
                sliceFieldName={renderFieldAccessor(item.key)}
                iconButtonProps={provided.dragHandleProps}
                WidgetIcon={WidgetIcon}
              />
              <Button variant="buttons.darkSmall" onClick={() => setSelectMode(true)}>
                Add Field
              </Button>
            </Flex>
          </Li>
          
        </Fragment>
        )}
      </Draggable> */}
      <SelectFieldTypeModal
        data={{ isOpen: selectMode }}
        close={() => setSelectMode(false)}
        onSelect={onSelectFieldType}
        widgetsArray={[]}
      />
    </Fragment>
  )
}

export default CustomListItem


/**
 * <Box sx={{ ml: 4 }}>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={"my-unique-id"}>
                  {(provided) => !snapshot.isDragging && (
                    <ul ref={provided.innerRef} {...provided.droppableProps}>
                      {
                        item.value.fields.map((e, i) => {
                          return (
                            <Draggable draggableId={`tab-group-${e.key}`} index={i}>
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
                                      text={e.key}
                                      sliceFieldName={renderFieldAccessor(e.key)}
                                      iconButtonProps={provided.dragHandleProps}
                                      WidgetIcon={WidgetIcon}
                                    />
                                  </Flex>
                                </Li>
                              </Fragment>
                              )}
                            </Draggable>
                          )
                        })
                      }

                      {
                        newFieldData && (
                          <NewField
                            {...newFieldData}
                            // fields={poolOfFieldsToCheck || fields}
                            fields={[]}
                            onSave={(...args) => {
                              onSaveNewField(...args)
                              setNewFieldData(null)
                            }}
                            onCancelNewField={onCancelNewField}
                          />
                        )
                      }
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
          </Box>
 */