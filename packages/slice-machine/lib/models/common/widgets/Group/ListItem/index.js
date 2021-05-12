import { Fragment, useState, useContext } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { MenuButton, Menu, MenuItem, MenuList } from '@reach/menu-button'
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

import Li from '../../../../../../components/Li'
import IconButton from '../../../../../../components/IconButton'
import ItemHeader from '../../../../../../components/ItemHeader'

import * as Widgets from 'lib/models/common/widgets'

import sliceBuilderArray from 'lib/models/common/widgets/sliceBuilderArray'

import Hint from 'lib/builders/common/Zone/Card/components/Hints'

import { AiOutlineEdit } from 'react-icons/ai'
import { BsThreeDotsVertical } from 'react-icons/bs'

import ListItem from 'components/ListItem'

const CustomListItem = ({
  tabId,
  store,
  widget,
  snapshot,
  framework,
  showHints,
  isRepeatable,
  item: groupItem,
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

  const onSaveNewField = ({ id, widgetTypeName }) => {
    const widget = Widgets[widgetTypeName]
    store
      .tab(tabId)
      .group(groupItem.key)
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
    store.tab(tabId).group(groupItem.key).reorderWidget(result.source.index, result.destination.index)
  }

  return (
    <Fragment>
      <ListItem
        item={groupItem}
        widget={widget}
        renderFieldAccessor={(key) => `data.${groupItem.key}.[...]`}
        {...rest}
        CustomEditElement={(
          <Button mr={2} variant="buttons.darkSmall" onClick={() => setSelectMode(true)}>
            Add Widget
          </Button>
        )}
        children={(
          <Box sx={{ ml: 4 }}>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={"my-unique-id"}>
                  {(provided) => !snapshot.isDragging && (
                    <ul ref={provided.innerRef} {...provided.droppableProps}>
                      {
                        groupItem.value.fields.map((item, index) => {
                          const { value: { config, type } } = item
                          const widget = findWidgetByConfigOrType(Widgets, config, type)
                          if (!widget) {
                            return (
                              <Li><Text>Field type "{type}" not supported</Text></Li>
                            )
                          }

                          const props = {
                            item,
                            index,
                            widget,
                            snapshot,
                            key: item.key,
                            renderFieldAccessor: (key) => `data.${groupItem.key}.${key}`,
                            // enterEditMode,
                            // deleteItem: onDeleteItem,
                            draggableId: `list-item-${item.key}-${index}`,
                          }

                          const HintElement = (
                            <Hint
                              item={item}
                              show={showHints}
                              isRepeatable={isRepeatable}
                              renderHintBase={({ item }) => `data.${groupItem.key}.${item.key}`}
                              framework={framework}
                              Widgets={Widgets}
                              typeName={widget.CUSTOM_NAME || widget.TYPE_NAME}
                            />
                          )
                          return (
                            <ListItem
                              {...props}
                              HintElement={HintElement}
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
      <SelectFieldTypeModal
        data={{ isOpen: selectMode }}
        close={() => setSelectMode(false)}
        onSelect={onSelectFieldType}
        widgetsArray={sliceBuilderArray}
      />
    </Fragment>
  )
}

export default CustomListItem
