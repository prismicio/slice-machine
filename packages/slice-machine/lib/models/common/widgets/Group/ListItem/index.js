import { Fragment, useState } from 'react'

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
import EditModal from 'lib/builders/common/EditModal'

import { findWidgetByConfigOrType } from '../../../../../builders/utils'

import * as Widgets from 'lib/models/common/widgets'

import sliceBuilderArray from 'lib/models/common/widgets/sliceBuilderArray'

import Hint from 'lib/builders/common/Zone/Card/components/Hints'

import ListItem from 'components/ListItem'

const CustomListItem = ({
  tabId,
  store,
  Model,
  widget,
  snapshot,
  framework,
  showHints,
  isRepeatable,
  item: groupItem,
  draggableId,
  renderFieldAccessor,
  ...rest
}) => {
  const [selectMode, setSelectMode] = useState(false)
  const [newFieldData, setNewFieldData] = useState(null)
  const [editModalData, setEditModalData] = useState({ isOpen: false })

  const onSelectFieldType = (widgetTypeName) => {
    setNewFieldData({ widgetTypeName })
    setSelectMode(false)
  }

  const getFieldMockConfig = ({ apiId }) => {
    console.log('mock config', Model.mockConfig?.[tabId]?.[groupItem.key]?.[apiId])
    return Model.mockConfig?.[tabId]?.[groupItem.key]?.[apiId]
  }

  const onCancelNewField = () => {
    setNewFieldData(null)
  }

  const closeEditModal = () => {
    setEditModalData({ isOpen: false })
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

  const onSaveField = ({ apiId, newKey, value, initialModelValues }, { initialMockConfig, mockValue }) => {
    if (mockValue && Object.keys(mockValue).length) {
      store
        .tab(tabId)
        .updateWidgetMockConfig(initialMockConfig, apiId, newKey, mockValue)
    } else {
      store
        .tab(tabId)
        .deleteWidgetMockConfig(initialMockConfig, apiId)
    }

    const widget = Widgets[initialModelValues.type]
    if (!widget) {
      console.log(`Could not find widget with type name "${initialModelValues.type}". Please contact us!`)
      return
    }

    store
      .tab(tabId)
      .group(groupItem.key)
      .replaceWidget(
        apiId,
        newKey,
        {
          type: initialModelValues.type,
          [widget.customAccessor || 'config']: removeKeys(value, ['id', 'type'])
        }
      )
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

  const onDeleteItem = (key) => {
    store.tab(tabId).group(groupItem.key).deleteWidget(key)
  }

  const enterEditMode = (field) =>{
    setEditModalData({ isOpen: true, field })
  }

  return (
    <Fragment>
      <ListItem
        item={groupItem}
        widget={widget}
        draggableId={draggableId}
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
                <Droppable droppableId={`${tabId}-${groupItem.key}-zone`}>
                  {(provided) => !snapshot.isDragging && (
                    <ul ref={provided.innerRef} {...provided.droppableProps}>
                      {
                        groupItem.value.fields.map((item, index) => {
                          const { value: { config, type } } = item
                          const widget = findWidgetByConfigOrType(Widgets, config, type)
                          if (!widget) {
                            return null
                          }

                          const props = {
                            item,
                            index,
                            widget,
                            snapshot,
                            key: item.key,
                            renderFieldAccessor: (key) => `data.${groupItem.key}.${key}`,
                            enterEditMode,
                            deleteItem: onDeleteItem,
                            draggableId: `group-${groupItem.key}-${item.key}-${index}`,
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
      <EditModal
        Model={Model}
        data={editModalData}
        close={closeEditModal}
        onSave={onSaveField}
        fields={groupItem.value.fields}
        getFieldMockConfig={getFieldMockConfig}
      />
    </Fragment>
  )
}

export default CustomListItem
