import React, { useState } from 'react'

import {
  Box,
  Button,
  Close,
  Flex,
  Heading
} from 'theme-ui'
import FieldsList from '../FieldsList'

import * as Widgets from '../../../widgets'

import SelectFieldTypeModal from '../SelectFieldTypeModal'
import EditModal from '../EditModal'

const PreviewFields = ({ Model }) => {
  const [editModalData, setEditModalData] = useState({ isOpen: false })
  const [selectModalData, setSelectModalData] = useState({ isOpen: false })
  const [newFieldData, setNewFieldData] = useState(null)
  const primary = Model.primary()
  const items = Model.items()

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
    Model.add[newFieldData.zone](
      id,
      {
        type: fieldType,
        config: widget.create(id)
      }
    )
    setNewFieldData(null)
  }

  return (
    <Box>
      <FieldsList
        enterEditMode={(field) => enterEditMode('primary', field)}
        title="Primary fields"
        fields={primary}
        modelFieldName="primary"
        Model={Model}
        newField={
          newFieldData
          && newFieldData.zone === 'primary'
          && newFieldData
        }
        onSaveNewField={onSaveNewField}
      />
      <Button
        mb={4}
        onClick={() => enterSelectMode('primary')}
      >
        Add
      </Button>
      <FieldsList
        enterEditMode={(field) => enterEditMode('items', field)}
        title="Repeatable fields"
        modelFieldName="items"
        fields={items}
        Model={Model}
        newField={
          newFieldData &&
          newFieldData.zone === 'items' &&
          newFieldData
        }
      />
      <Button
        mb={4}
        onClick={() => enterSelectMode('items')}
      >
        Add
      </Button>
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