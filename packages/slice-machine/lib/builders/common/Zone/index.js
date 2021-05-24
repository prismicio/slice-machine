import React, { useState, Fragment } from 'react'
import {
  array,
  arrayOf,
  bool,
  shape,
  string,
  object,
  func
} from 'prop-types'

import Card from './Card'

import { Heading, Button } from 'theme-ui'

import SelectFieldTypeModal from '../SelectFieldTypeModal'
import NewField from './Card/components/NewField'

import ZoneHeader from './components/ZoneHeader'
import EmptyState from './components/EmptyState'

const Zone = ({
  Model,
  store,
  tabId,
  title, /* text info to display in Card Header */
  fields, /* widgets registered in the zone */
  poolOfFieldsToCheck, /* if you need to check unicity of fields from other zones */
  widgetsArray, /* Array of available widget fields */
  isRepeatable, /* should we wrap hints in map ? */
  onDeleteItem, /* user clicked on "Delete field" */
  onSaveNewField, /* user clicked on "Save" (NewField) */
  onDragEnd, /* user dragged item to an end location */
  EditModal, /* temp */
  onSave, /* user clicked on "Save" (EditModal) */
  dataTip, /* text info to display as tip */
  getFieldMockConfig, /* access mock configuration of given apiId */
  renderHintBase, /* render base (eg. path to slice) content for hints */
  renderFieldAccessor, /* render field accessor (eg. slice.primary.title) */

}) => {

  const widgetsArrayWithCondUid = (() => {
    const hasUid = !!Object.entries(poolOfFieldsToCheck).find(([, { value }]) => value.type === 'UID')
    return hasUid
      ? widgetsArray.filter(({ TYPE_NAME }) => TYPE_NAME !== 'UID')
      : widgetsArray
  })();

  const [showHints, setShowHints] = useState(false)
  const [editModalData, setEditModalData] = useState({ isOpen: false })
  const [selectModalData, setSelectModalData] = useState({ isOpen: false })
  const [newFieldData, setNewFieldData] = useState(null)

  const enterEditMode = (field) => {
    setEditModalData({ isOpen: true, field })
  }
  const enterSelectMode = () => {
    setSelectModalData({ isOpen: true })
  }

  const closeEditModal = () => {
    setEditModalData({ isOpen: false })
  }
  const closeSelectModal = () => setSelectModalData({ isOpen: false })

  const onSelectFieldType = (widgetTypeName) => {
    setNewFieldData({ widgetTypeName, fields })
    setSelectModalData({ isOpen: false })
  }

  const onCancelNewField = () => setNewFieldData(null)

  return (
    <Fragment>
      <ZoneHeader
        Heading={<Heading as="h6">{title}</Heading>}
        Actions={fields.length ? (
          <Fragment>
            <Button
              variant="buttons.lightSmall"
              onClick={() => setShowHints(!showHints)}
            >
              { showHints ? 'Hide' : 'Show'} Code Widgets
            </Button>
            <Button ml={2} variant="buttons.darkSmall" onClick={() => enterSelectMode()}>
              Add a new Field
            </Button>
          </Fragment>
        ) : null}
      />
      {
        !fields.length && !newFieldData ? (
          <EmptyState onEnterSelectMode={() => enterSelectMode()} />
        ) : null
      }
      <Card
        tabId={tabId}
        isRepeatable={isRepeatable}
        fields={fields}
        showHints={showHints}
        store={store}
        Model={Model}
        dataTip={dataTip}
        title={title}
        renderFieldAccessor={renderFieldAccessor}
        renderHintBase={renderHintBase}
        enterEditMode={enterEditMode}
        enterSelectMode={enterSelectMode}
        onDragEnd={onDragEnd}
        onDeleteItem={onDeleteItem}
        NewFieldC={() => {
          return newFieldData && (
            <NewField
              {...newFieldData}
              fields={poolOfFieldsToCheck || fields}
              onSave={(...args) => {
                onSaveNewField(...args)
                setNewFieldData(null)
              }}
              onCancelNewField={onCancelNewField}
            />
          )
        }}
      />
      <EditModal
        Model={Model}
        data={editModalData}
        close={closeEditModal}
        onSave={onSave}
        fields={poolOfFieldsToCheck}
        getFieldMockConfig={getFieldMockConfig}
      />
      <SelectFieldTypeModal
        data={selectModalData}
        close={closeSelectModal}
        onSelect={onSelectFieldType}
        widgetsArray={widgetsArrayWithCondUid}
      />
    </Fragment>
  )
}

Zone.propTypes = {
  isRepeatable: bool,
  Model: object.isRequired, // todo
  title: string.isRequired,
  dataTip: string.isRequired,
  showHints: bool,
  onSave: func.isRequired,
  onSaveNewField: func.isRequired,
  onDragEnd: func.isRequired,
  onDeleteItem: func.isRequired,
  poolOfFieldsToCheck: arrayOf(shape({ key: string, value: object })),
  // how to access mock config for given key
  getFieldMockConfig: func.isRequired,
  renderHintBase: func.isRequired,
  renderFieldAccessor: func.isRequired,
  widgetsArray: array.isRequired,
  fields: arrayOf(shape({
    key: string.isRequired,
    value: shape({
      config: object,
      fields: array,
      type: string.isRequired
    })
  }))
}

export default Zone
