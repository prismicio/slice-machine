import { Fragment, useContext } from 'react'
import { useThemeUI } from 'theme-ui'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { ConfigContext } from 'src/config-context'
import * as Widgets from '../../../../models/common/widgets'

import { FaRegQuestionCircle, FaPlus } from 'react-icons/fa'

import {
  Button,
  Flex,
  Heading,
} from 'theme-ui'

import Card from 'components/Card'
import Tooltip from 'components/Tooltip'

import ListItem  from 'components/ListItem'

import Hint from './components/Hints'

import { findWidgetByConfigOrType } from '../../../utils'
// import NewField from './components/NewField'

const FieldZone = ({
  fields,
  store,
  title,
  tabId,
  enterEditMode,
  enterSelectMode,
  dataTip,
  onDragEnd,
  renderFieldAccessor,
  onDeleteItem,
  showHints,
  NewFieldC,
  renderHintBase,
  isRepeatable
}) => {
  const { env: { framework } } = useContext(ConfigContext)
  return (
    <Fragment>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={title}>
          {(provided, snapshot) => (
            <ul ref={provided.innerRef} {...provided.droppableProps}>
              { fields.map((item, index) => {
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
                  enterSelectMode,
                  renderFieldAccessor,
                  enterEditMode,
                  deleteItem: onDeleteItem,
                  draggableId: `list-item-${item.key}-${index}`,
                }

                if (widget.CustomListItem) {
                  const { CustomListItem } = widget
                  return (
                    <CustomListItem {...props} />
                  )
                }

                const HintElement = (
                  <Hint
                    item={item}
                    show={showHints}
                    isRepeatable={isRepeatable}
                    renderHintBase={renderHintBase}
                    framework={framework}
                    typeName={widget.CUSTOM_NAME || widget.TYPE_NAME}
                  />
                )
                return (
                  <ListItem
                    {...props}
                    HintElement={HintElement}
                  />
                )
              })}
              {provided.placeholder}
              <NewFieldC />
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </Fragment>
  )
}

export default FieldZone