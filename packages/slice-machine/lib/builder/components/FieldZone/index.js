import { useState, Fragment } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import {
  Box,
  Button,
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

const FieldZone = ({
  fields,
  title,
  enterEditMode,
  enterSelectMode,
  modelFieldName,
  newField,
  Model,
  onDragEnd,
  onSaveNewField,
  onDeleteItem
}) => {
  const _onDragEnd = (result) => {
    onDragEnd(result, modelFieldName)
  }

  const _onDeleteItem = (key) => {
    onDeleteItem(key, modelFieldName)
  }

  return (
    <Box>
      <Heading>{title}</Heading>
      <DragDropContext onDragEnd={_onDragEnd}>
        <Droppable droppableId={modelFieldName}>
          {(provided) => (
            <ul ref={provided.innerRef} {...provided.droppableProps}>
              {fields.map((item, index) => (
                <DraggableItem
                  item={item}
                  key={item.key}
                  index={index}
                  enterEditMode={enterEditMode}
                  deleteItem={_onDeleteItem}
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
      <Button
        mb={4}
        onClick={() => enterSelectMode(modelFieldName)}
      >
        Add
      </Button>
    </Box>
  )
}

export const NonRepeatZone = ({
  enterEditMode,
  newFieldData,
  ...rest
}) => (
  <FieldZone
    enterEditMode={(field) => enterEditMode('primary', field)}
    title="Primary fields"
    modelFieldName="primary"
    newField = {
      newFieldData &&
      newFieldData.zone === 'primary' &&
      newFieldData
    }
    {...rest}
  />
)

export const RepeatZone = ({
  enterEditMode,
  newFieldData,
  ...rest
}) => (
  <FieldZone
    enterEditMode={(field) => enterEditMode('items', field)}
    title="Repeatable fields"
    modelFieldName="items"
    newField={
      newFieldData &&
      newFieldData.zone === 'items' &&
      newFieldData
    }
    {...rest}
  />
)

export default FieldZone