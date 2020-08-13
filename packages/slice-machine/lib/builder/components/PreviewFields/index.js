import React, { useContext, useState } from 'react'

import { ModelContext } from "../../../../src/model-context"

import {
  Box,
} from 'theme-ui'

import { NonRepeatZone, RepeatZone } from '../FieldZone'

import * as Widgets from '../../../widgets'

import SelectFieldTypeModal from '../SelectFieldTypeModal'
import EditModal from '../EditModal'

const PreviewFields = () => {
  const { primary, items, isTouched, ...Model } = useContext(ModelContext)

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
    <Box>
      <p>is touched: {isTouched ? 'true' : 'false' }</p>
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
      <EditModal
        data={editModalData}
        close={closeEditModal}
        Model={Model}
      />
      <SelectFieldTypeModal
        data={selectModalData}
        close={closeSelectModal}
        onSelect={onSelectFieldType}
      />
    </Box>
  );
}

export default PreviewFields