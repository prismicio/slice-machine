import { Fragment } from 'react'
import { useThemeUI } from 'theme-ui'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'

import { FaRegQuestionCircle, FaPlus } from 'react-icons/fa'

import {
  Button,
  Flex,
  Heading,
} from 'theme-ui'

import Card from 'components/Card'
import Tooltip from 'components/Tooltip'

import ListItem  from './components/ListItem'
import NewField from './components/NewField'

const dataTipText = ` The non-repeatable zone
  is for fields<br/> that should appear once, like a<br/>
  section title.
`
const dataTipText2 = `The repeatable zone is for a group<br/>
  of fields that you want to be able to repeat an<br/>
  indeterminate number of times, like FAQs`

const FieldZone = ({
  fields,
  title,
  enterEditMode,
  enterSelectMode,
  modelFieldName,
  newField,
  dataTip,
  onDragEnd,
  onCancelNewField,
  onSaveNewField,
  onDeleteItem,
  showHints,
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
            bg: 'headSection',
            alignItems: 'center',
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            borderBottom: t => `1px solid ${t.colors.borders}`,
          }}
        >
          <Tooltip id="question-circle" />
          <Heading as="h5" mr={2}>{title}</Heading>
          <FaRegQuestionCircle
            data-for="question-circle"
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
                      deleteItem={onDeleteItem}
                      showHints={showHints}
                    />
                  ))}
                  {provided.placeholder}
                  {newField && (
                    <NewField {...newField} onCancelNewField={onCancelNewField} onSave={onSaveNewField} />
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
    dataTip={dataTipText}
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
    dataTip={dataTipText2}
    {...rest}
  />
)

export default FieldZone