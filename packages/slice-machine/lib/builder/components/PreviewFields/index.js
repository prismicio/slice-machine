import React, { useContext, useState, Fragment } from 'react'

import { ModelContext } from "src/model-context"

import Card from 'components/Card'

import {
  Flex,
  Box,
  Text,
  Heading
} from 'theme-ui'

import {
  FaRegClock,
  FaRegArrowAltCircleRight
} from 'react-icons/fa'

import { NonRepeatZone, RepeatZone } from '../FieldZone'

import * as Widgets from '../../../widgets'

import SelectFieldTypeModal from '../SelectFieldTypeModal'
import EditModal from '../EditModal'

const RADIUS = '6px'

const TouchedIcon = () => (
  <Flex
    sx={{
      ml: 2,
      top: '1px',
      position: 'relative',
      color: 'grey',
      alignItems: 'center'
    }}
  >
    Touched
    <FaRegClock style={{ marginLeft: '6px'}} />
  </Flex>
)

const Header = ({ title, isTouched, radius }) => (
  <Flex
    sx={{
      px: 4,
      py: 3,
      bg: '#FFF',
      alignItems: 'center',
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
      borderBottom: t => `1px solid ${t.colors.borders}`
    }}
  >
    <Heading as="h4">
      {title}
    </Heading>
    { isTouched ? <TouchedIcon /> : null}
  </Flex>
)

const SubHeader = () => (
  <Flex
    as="a"
    href="/example"
    target="_blank"
    sx={{
      px: 4,
      py: 2,
      bg: 'gray',
      alignItems: 'center',
      cursor: 'pointer',
      textDecoration: 'none',
      borderBottom: t => `1px solid ${t.colors.borders}`
    }}
  >
    <Text as="p" sx={{ color: 'black', display: 'flex', alignItems: 'center' }}>
      <FaRegArrowAltCircleRight /> <Text as="span" sx={{ ml: 2 }}>Preview component</Text>
    </Text>
  </Flex>
)

const PreviewFields = () => {
  const { meta: { fieldset }, primary, items, isTouched, ...Model } = useContext(ModelContext)


  const [editModalData, setEditModalData] = useState({ isOpen: false })
  const [selectModalData, setSelectModalData] = useState({ isOpen: false })
  const [newFieldData, setNewFieldData] = useState(null)

  const enterEditMode = (fieldType, field) => {
    setEditModalData({ isOpen: true, fieldType, field })
  }
  const enterSelectMode = (zone) => {
    setSelectModalData({ isOpen: true, zone })
  }

  const closeEditModal = () => setEditModalData({ isOpen: false })
  const closeSelectModal = () => setSelectModalData({ isOpen: false })

  const onSelectFieldType = (zone, fieldType) => {
    setNewFieldData({
      zone,
      fieldType
    })
    setSelectModalData({ isOpen: false })
  }
  const onSaveNewField = ({ id, fieldType }) => {
    const widget = Widgets[fieldType]
    Model.hydrate(Model.add[newFieldData.zone](
      id,
      {
        type: fieldType,
        config: widget.create(id)
      }
    ))
    setNewFieldData(null)
  }

  const onDragEnd = (result, modelFieldName) => {
    if (!result.destination) {
      return
    }
    Model.hydrate(Model.reorder[modelFieldName](
      result.source.index,
      result.destination.index
    ))
  }

  const onDeleteItem = (key, modelFieldName) => {
    Model.hydrate(Model.delete[modelFieldName](key))
  }

  return (
    <Fragment>
      <Card
        bg="#FFF"
        Header={(props) => <Header title={fieldset} isTouched={isTouched} {...props} /> }
        SubHeader={(props) => <SubHeader {...props} /> }
        Body={() => (
          <Fragment>
            <NonRepeatZone
              enterEditMode={enterEditMode}
              enterSelectMode={enterSelectMode}
              fields={primary}
              Model={Model}
              newFieldData={newFieldData}
              onSaveNewField={onSaveNewField}
              onDragEnd={onDragEnd}
              onDeleteItem={onDeleteItem}
            />
            <Box my={3} sx={{ height: '1px', width: '1px'}} />
            <RepeatZone
              enterEditMode={enterEditMode}
              enterSelectMode={enterSelectMode}
              fields={items}
              Model={Model}
              newFieldData={newFieldData}
              onSaveNewField={onSaveNewField}
              onDragEnd={onDragEnd}
              onDeleteItem={onDeleteItem}
            />
          </Fragment>
        )}
      />
      {
        editModalData && editModalData.isOpen ? (
          <EditModal
            data={editModalData}
            close={closeEditModal}
            Model={Model}
          />
        ) : null
      }
      <SelectFieldTypeModal
        data={selectModalData}
        close={closeSelectModal}
        onSelect={onSelectFieldType}
      />
    </Fragment>
  )
}

export default PreviewFields