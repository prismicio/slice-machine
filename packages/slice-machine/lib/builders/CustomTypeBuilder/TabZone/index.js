import { Fragment, useState } from 'react'
import * as Widgets from '@lib/models/common/widgets/withGroup'
import EditModal from '../../common/EditModal'

import {
  ensureDnDDestination,
  ensureWidgetTypeExistence
} from '@lib/utils'

import Zone from '../../common/Zone'

import ctBuilderArray from '@lib/models/common/widgets/ctBuilderArray'
import { CustomTypeMockConfig } from '@lib/models/common/MockConfig'

import SliceZone from '../SliceZone'

import ModalFormCard from 'components/ModalFormCard'

const TabZone = ({
  Model,
  store,
  tabId,
  fields,
  sliceZone,
  showHints,
}) => {

  const [modaIsOpen, setModalIsOpen] = useState(false)

  const onDeleteItem = (key) => {
    store.deleteWidgetMockConfig(Model.mockConfig, key)
    store
      .tab(tabId)
      .removeWidget(key)
  }

  const getFieldMockConfig = ({ apiId }) => {
    return CustomTypeMockConfig.getFieldMockConfig(Model.mockConfig, apiId)
  }

  const onDeleteTab = () => {
    store.tab(tabId).delete()
  }

  const onSaveNewField = ({ id, widgetTypeName }) => {
    if (ensureWidgetTypeExistence(Widgets, widgetTypeName)) {
      return
    }
    const widget = Widgets[widgetTypeName]
    store
      .tab(tabId)
      .addWidget(id, widget.create())
  }

  const onDragEnd = (result) => {
    if (ensureDnDDestination(result)) {
      return
    }
    store.tab(tabId).reorderWidget(result.source.index, result.destination.index)
  }

  const onSave = ({ apiId: previousKey, newKey, value, mockValue }) => {
    if (ensureWidgetTypeExistence(Widgets, value.type)) {
      return
    }
    if (mockValue) {
      store.updateWidgetMockConfig(Model.mockConfig, previousKey, newKey, mockValue)
    } else {
      store.deleteWidgetMockConfig(Model.mockConfig, newKey)
    }

    store
      .tab(tabId)
      .replaceWidget(
        previousKey,
        newKey,
        value
      )
  }

  const onCreateSliceZone = () => {
    store.tab(tabId).createSliceZone()
  }

  const onDeleteSliceZone = () => {
    store.tab(tabId).deleteSliceZone()
  }

  const onSelectSharedSlices = (keys, preserve = []) => {
    store.tab(tabId).replaceSharedSlices(keys, preserve)
  }

  const onRemoveSharedSlice = (key) => {
    store.tab(tabId).removeSharedSlice(key)
  }

  return (
    <Fragment>
      {/* { JSON.stringify(Model.mockConfig, null, 2) } */}
      <Zone
        tabId={tabId}
        Model={Model}
        store={store}
        title="Static Zone"
        dataTip={""}
        fields={fields}
        poolOfFieldsToCheck={Model.poolOfFieldsToCheck}
        showHints={showHints}
        EditModal={EditModal}
        widgetsArray={ctBuilderArray}
        getFieldMockConfig={getFieldMockConfig}
        onDeleteItem={onDeleteItem}
        onSave={onSave}
        onSaveNewField={onSaveNewField}
        onDragEnd={onDragEnd}
        renderHintBase={({ item }) => `data.${item.key}`}
        renderFieldAccessor={(key) => `data.${key}`}
      />
      {/* {
        Model.current.tabs.length > 1 ? (
          <button onClick={() => onDeleteTab()}>Delete Tab</button>
        ) : null
      } */}
      <SliceZone
        tabId={tabId}
        sliceZone={sliceZone}
        onDelete={onDeleteSliceZone}
        onRemoveSharedSlice={onRemoveSharedSlice}
        onCreateSliceZone={onCreateSliceZone}
        onSelectSharedSlices={onSelectSharedSlices}
      />
      <ModalFormCard isOpen={modaIsOpen} content={{ title: 'Edit Tab'}} close={() => setModalIsOpen(false)}>
        {(props) => {
          return (
            <div>hello</div>
          )
        }}
      </ModalFormCard>
    </Fragment>
  )
}

export default TabZone
