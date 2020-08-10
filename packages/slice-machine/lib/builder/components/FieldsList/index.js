import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import {
  Box,
  Flex,
  Text,
  Heading,
  Badge,
  IconButton as ThemeIconButton
} from 'theme-ui'

import {
  FaEdit,
  FaTrashAlt,
  FaBars
} from "react-icons/fa";

import NewField from './NewField'

const IconButton = ({ onClick, label, Icon, ...rest }) => (
  <ThemeIconButton
    onClick={onClick}
    aria-label={label}
    {...rest}
  >
    <Icon />
  </ThemeIconButton>
);

const DraggableItem = ({ item, index, deleteItem, enterEditMode }) => {
  const { key } = item
  const { type, config: { label } } = item.value
  return (
    <Draggable draggableId={key} index={index}>
      {(provided) => (
        <Flex
          ref={provided.innerRef}
          {...provided.draggableProps}
          as="li"
          p={3}
          sx={{
            border: "1px solid #F1F1F1",
            justifyContent: "space-between",
          }}
        >
          <IconButton
            {...provided.dragHandleProps}
            label="Reorder slice field (drag and drop)"
            Icon={FaBars}
          />
          <Text>
            {label || key} (id: {key})
          </Text>
          <Box>
            <IconButton
              Icon={FaEdit}
              label="Edit slice field"
              sx={{ cursor: 'pointer' }}
              onClick={() => enterEditMode([key, item.value])}
            />
            <IconButton
              Icon={FaTrashAlt}
              label="Delete slice field"
              sx={{ cursor: 'pointer' }}
              onClick={() => deleteItem(key)}
              ml={2}
            />
            <Badge ml={2}>{type}</Badge>
          </Box>
        </Flex>
      )}
    </Draggable>
  );
}

const FieldsList = ({
  fields,
  title,
  enterEditMode,
  modelFieldName,
  newField,
  Model,
  onSaveNewField
}) => {
  const [state, setState] = useState({ items: fields })

  const onDragEnd = (result) => {
    if (!result.destination) {
      return
    }
    setState({
      items: Model.reorder[modelFieldName](
        result.source.index,
        result.destination.index
      )
    })
  }

  const deleteItem = (key) => {
    setState({
      items: Model.delete[modelFieldName](key),
    })
  }

  return (
    <Box>
      <Heading>{title}</Heading>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={modelFieldName}>
          {(provided) => (
            <ul ref={provided.innerRef} {...provided.droppableProps}>
              {state.items.map((item, index) => (
                <DraggableItem
                  item={item}
                  key={item.key}
                  index={index}
                  enterEditMode={enterEditMode}
                  deleteItem={deleteItem}
                />
              ))}
              {provided.placeholder}
              {newField && (
                <NewField {...newField} Model={Model} onSave={onSaveNewField} />
              )}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
  
  
}

export default FieldsList