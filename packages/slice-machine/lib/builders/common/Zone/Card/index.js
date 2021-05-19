import { Fragment, useContext, useState } from 'react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { ConfigContext } from 'src/config-context'

import { getDraggedDom, getDraggedDomPosition } from 'components/ListItem/utils'

import {
  Box,
  Text,
} from 'theme-ui'

import ListItem  from 'components/ListItem'

import Hint from './components/Hints'

import { findWidgetByConfigOrType } from '../../../utils'

import * as Widgets from 'lib/models/common/widgets/withGroup'

import Li from 'components/Li'

const FieldZone = ({
  fields,
  store,
  Model,
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
  const [isMouseDown, setIsMouseDown] = useState(false)
  const { env: { framework } } = useContext(ConfigContext)

  const [placeholderProps, setPlaceholderProps] = useState(null)
  
  const onDragStart = (event) => {
    setPlaceholderProps(getDraggedDomPosition(event))
  }

  const handleDragUpdate = event => {
    if (!event.destination) {
      return;
    }

    const draggedDOM = getDraggedDom(event.draggableId);

    if (!draggedDOM) {
      return;
    }

    const { clientHeight, clientWidth } = draggedDOM;
    const destinationIndex = event.destination.index;
    const sourceIndex = event.source.index;

    const childrenArray = [...draggedDOM.parentNode.children];
    const movedItem = childrenArray[sourceIndex];
    childrenArray.splice(sourceIndex, 1);

    const updatedArray = [
      ...childrenArray.slice(0, destinationIndex),
      movedItem,
      ...childrenArray.slice(destinationIndex + 1)
    ];

    var clientY =
      parseFloat(window.getComputedStyle(draggedDOM.parentNode).paddingTop) +
      updatedArray.slice(0, destinationIndex).reduce((total, curr) => {
        const style = curr.currentStyle || window.getComputedStyle(curr);
        const marginBottom = parseFloat(style.marginBottom);
        return total + curr.clientHeight + marginBottom;
      }, 0);

    setPlaceholderProps({
      clientHeight,
      clientWidth,
      clientY,
      clientX: parseFloat(
        window.getComputedStyle(draggedDOM.parentNode).paddingLeft
      )
    });
  };

  const onMouseDownDrag = () => {
    setIsMouseDown(true)
  }

  const onMouseUpDrag = () => {
    setIsMouseDown(false)
    
  }

  const _onDragEnd =(event) => {
    onDragEnd(event)
    onMouseUpDrag()
  }

  return (
    <Fragment>
      <DragDropContext onDragStart={onMouseDownDrag} onDragEnd={_onDragEnd}>
        <Droppable droppableId={title}>
          {(provided, snapshot) => (
            <Box
              as="ul"
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ ...provided.droppableProps.style, padding: '4px 0'}}
            >
              { fields.map((item, index) => {
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
                  store,
                  Model,
                  tabId,
                  widget,
                  showHints,
                  key: item.key,
                  enterSelectMode,
                  renderFieldAccessor,
                  enterEditMode,
                  parentSnapshot: snapshot,
                  deleteItem: onDeleteItem,
                  draggableId: `list-item-${item.key}`,
                  dragMouseIsDown: isMouseDown,
                  onMouseDownDrag,
                  onMouseUpDrag
                }

                if (widget.CustomListItem) {
                  const { CustomListItem } = widget
                  return (
                    <CustomListItem {...props} framework={framework} />
                  )
                }

                const HintElement = (
                  <Hint
                    item={item}
                    show={showHints}
                    isRepeatable={isRepeatable}
                    renderHintBase={renderHintBase}
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
              })}
              { provided.placeholder }
              {/* {placeholderProps && Object.keys(placeholderProps) && snapshot.isDraggingOver && (
                <div
                  className="placeholder"
                  style={{
                    top: placeholderProps.clientY,
                    left: placeholderProps.clientX,
                    height: placeholderProps.clientHeight,
                    width: placeholderProps.clientWidth,
                    background: 'tomato',
                    position: 'absolute'
                  }}
                />
              )} */}
              <NewFieldC />
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Fragment>
  )
}

export default FieldZone