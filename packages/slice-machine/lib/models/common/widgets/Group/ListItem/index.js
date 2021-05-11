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
import { sliceBuilderWidgetsArray } from 'lib/models/common/widgets/asArray'


import Li from '../../../../../../components/Li'
import IconButton from '../../../../../../components/IconButton'
import ItemHeader from '../../../../../../components/ItemHeader'

import * as Widgets from '../../../widgets'

import { AiOutlineEdit } from 'react-icons/ai'
import { BsThreeDotsVertical } from 'react-icons/bs'

// import Hint from './Hints'

import { findWidgetByConfigOrType } from '../../../../../utils'

const CustomListItem = (props) => {
  const {
    item,
    index,
    store,
    tabId,
    deleteItem,
    enterEditMode,
    modelFieldName,
    renderHintBase,
    renderFieldAccessor,
    isRepeatable,
    showHints,

    theme,
    config,
    WidgetIcon
  } = props

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
    const widget = Widgets[widgetTypeName]
    if (!widget) {
      console.log(`Could not find widget with type name "${widgetTypeName}". Please contact us!`)
    }
    store
      .tab(tabId)
      .group(item.key)
      .addWidget(id, {
        type: widget.TYPE_NAME,
        [widget.customAccessor || 'config']: removeKeys(widget.create(id), ['id'])
      })
  }


  /**
   * apiId: "bool"
   initialModelValues: {
     type: "Boolean",
     config: {
       …}
   }
   newKey: "boola"
   value: {
       label: "",
       placeholder_false: "false",
       placeholder_true: "true",
       def
   */

  return (
    <Fragment>
      <Draggable draggableId={item.key} index={index}>
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
          <Box sx={{ ml: 4 }}>
            <DragDropContext onDragEnd={() => console.log('REORDER WIDGET')}>
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
        </Fragment>
        )}
      </Draggable>
      <SelectFieldTypeModal
        data={{ isOpen: selectMode }}
        close={() => setSelectMode(false)}
        onSelect={onSelectFieldType}
        widgetsArray={sliceBuilderWidgetsArray}
      />
    </Fragment>
  )
}

export default CustomListItem
