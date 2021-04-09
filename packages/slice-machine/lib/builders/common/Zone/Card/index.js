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
// import NewField from './components/NewField'

const FieldZone = ({
  fields,
  title,
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
  const { theme } = useThemeUI()

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
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={title}>
              {(provided) => (
                <ul ref={provided.innerRef} {...provided.droppableProps}>
                  {fields.map((item, index) => (
                    <ListItem
                      item={item}
                      key={item.key}
                      index={index}
                      renderFieldAccessor={renderFieldAccessor}
                      enterEditMode={enterEditMode}
                      deleteItem={onDeleteItem}
                      renderHintBase={renderHintBase}
                      isRepeatable={isRepeatable}
                      showHints={showHints}
                    />
                  ))}
                  {provided.placeholder}
                  <NewFieldC />
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </Fragment>
      )}
      Footer={() => (
        <Button
          onClick={enterSelectMode}
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

export default FieldZone