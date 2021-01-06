import React, { useState, Fragment } from 'react'

import {
  Box,
} from 'theme-ui'

import { NonRepeatZone, RepeatZone } from '../FieldZone'

import * as Widgets from '../../../widgets'

import SelectFieldTypeModal from '../SelectFieldTypeModal'
import EditModal from '../EditModal'

const PreviewFields = ({
  Model,
  variation,
  showHints,
}) => {
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