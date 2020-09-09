import { Fragment } from 'react'
import { useThemeUI } from 'theme-ui'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import ReactTooltip from 'react-tooltip'

import { FaRegQuestionCircle, FaPlus } from 'react-icons/fa'

import {
  Button,
  Flex,
  Heading,
} from 'theme-ui'

import Card from 'components/Card'

import ListItem  from './components/ListItem'
import NewField from './components/NewField'

const FieldZone = ({
  fields,
  title,
  enterEditMode,
  enterSelectMode,
  modelFieldName,
  newField,
  dataTip,
  onDragEnd,
  onSaveNewField,
  onDeleteItem
}) => {
  const { theme } = useThemeUI()

  const _onDragEnd = (result) => {
    onDragEnd(result, modelFieldName)
  }

  const _onDeleteItem = (key) => {
    onDeleteItem(key, modelFieldName)
  }

  return (
    <Card
      bg="gray"
      bodySx={{ p: 2 }}
      footerSx={{ px: 4, py: 3, display: 'flex', justifyContent: 'flex-end'}}
      Header={({ radius }) => (
        <Flex
          sx={{
            p: 3,
            bg: '#FFF',
            alignItems: 'center',
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            borderBottom: t => `1px solid ${t.colors.borders}`
          }}
        >
          <ReactTooltip type="light" multiline border borderColor={theme.colors.borders} />
          <Heading as="h5" mr={2}>{title}</Heading>
          <FaRegQuestionCircle
            color={theme.colors.icons}
            data-tip={dataTip}
            style={{ position: 'relative', top: '1px' }}
          />
        </Flex>
      )}
      Body={() => (
        <Fragment>
          <DragDropContext onDragEnd={_onDragEnd}>
            <Droppable droppableId={modelFieldName}>
              {(provided) => (
                <ul ref={provided.innerRef} {...provided.droppableProps}>
                  {fields.map((item, index) => (
                    <ListItem
                      item={item}
                      key={item.key}
                      index={index}
                      modelFieldName={modelFieldName}
                      enterEditMode={enterEditMode}
                      deleteItem={_onDeleteItem}
                    />
                  ))}
                  {provided.placeholder}
                  {newField && (
                    <NewField {...newField} onSave={onSaveNewField} />
                  )}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </Fragment>
      )}
      Footer={() => (
        <Button
          onClick={() => enterSelectMode(modelFieldName)}
          sx={{
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '54px',
            width: '54px',
            cursor: 'pointer'
          }}
        >
          <FaPlus color="#FFF" size={16} />
        </Button>
      )}
    />
  )
}

export const NonRepeatZone = ({
  enterEditMode,
  newFieldData,
  ...rest
}) => (
  <FieldZone
    enterEditMode={(field) => enterEditMode('primary', field)}
    title="Non-repeatable zone"
    modelFieldName="primary"
    newField={
      newFieldData &&
      newFieldData.zone === 'primary' &&
      newFieldData
    }
    dataTip="It is a long established fact that a reader will<br/> be distracted by the readable content of a page<br/> when looking at its layout."
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
    title="Repeatable zone"
    modelFieldName="items"
    newField={
      newFieldData &&
      newFieldData.zone === 'items' &&
      newFieldData
    }
    newFieldData
    dataTip="It is a long established fact that a reader will<br/> be distracted by the readable content of a page<br/> when looking at its layout."
    {...rest}
  />
)

export default FieldZone