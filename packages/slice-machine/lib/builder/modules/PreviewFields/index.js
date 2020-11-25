import React, { useState, Fragment } from 'react'

import {
  Flex,
  Box,
  Heading,
  Checkbox,
  Text,
} from 'theme-ui'

import {
  FaRegClock,
} from 'react-icons/fa'

import { NonRepeatZone, RepeatZone } from '../FieldZone'

import * as Widgets from '../../../widgets'

import SelectFieldTypeModal from '../SelectFieldTypeModal'
import EditModal from '../EditModal'

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
    Unsaved changes
    <FaRegClock style={{ marginLeft: '6px'}} />
  </Flex>
)

const Header = ({ title, isTouched, radius }) => (
  <Flex
    sx={{
      px: 4,
      py: 3,
      bg: 'headSection',
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

const PreviewFields = ({
  Model,
  variation,
  storybookUrl,
  showHints,
}) => {
  const { isTouched } = Model

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
      fieldType,
      variation
    })
    setSelectModalData({ isOpen: false })
  }
  const onSaveNewField = ({ id, fieldType }) => {
    const widget = Widgets[fieldType]
    Model.hydrate(variation.add[newFieldData.zone](
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
    Model.hydrate(variation.reorder[modelFieldName](
      result.source.index,
      result.destination.index
    ))
  }

  const onDeleteItem = (key, modelFieldName) => {
    Model.hydrate(variation.delete[modelFieldName](key))
  }

  const onCancelNewField = () => setNewFieldData(null)

  return (
    <Fragment>
      <Fragment>
        <NonRepeatZone
          enterEditMode={enterEditMode}
          enterSelectMode={enterSelectMode}
          fields={variation.primary}
          Model={Model}
          newFieldData={newFieldData}
          onCancelNewField={onCancelNewField}
          onSaveNewField={onSaveNewField}
          onDragEnd={onDragEnd}
          onDeleteItem={onDeleteItem}
          showHints={showHints}
        />
        <Box my={3} sx={{ height: '1px', width: '1px'}} />
        <RepeatZone
          enterEditMode={enterEditMode}
          enterSelectMode={enterSelectMode}
          fields={variation.items}
          Model={Model}
          newFieldData={newFieldData}
          onCancelNewField={onCancelNewField}
          onSaveNewField={onSaveNewField}
          onDragEnd={onDragEnd}
          onDeleteItem={onDeleteItem}
          showHints={showHints}
        />
      </Fragment>
      {
        editModalData && editModalData.isOpen ? (
          <EditModal
            data={editModalData}
            close={closeEditModal}
            Model={Model}
            variation={variation}
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