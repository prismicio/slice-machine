import { Fragment, useState } from 'react'
import * as Widgets from 'lib/models/common/widgets/withGroup'
import EditModal from '../../common/EditModal'

import Zone from '../../common/Zone'

import ctBuilderArray from 'lib/models/common/widgets/ctBuilderArray'
import { CustomTypeMockConfig } from 'lib/models/common/MockConfig'

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
    const widget = Widgets[widgetTypeName]
    if (!widget) {
      return console.log(`Could not find widget with type name "${widgetTypeName}". Please contact us!`)
    }
    store
      .tab(tabId)
      .addWidget(id, {
        type: widget.TYPE_NAME,
        config: widget.create()
      })
  }

  const onDragEnd = (result) => {
    if (!result.destination || result.source.index === result.destination.index) {
      return
    }
    if (result.source.droppableId !== result.destination.droppableId) {
      return
    }
    store.tab(tabId).reorderWidget(result.source.index, result.destination.index)
  }

  const onSave = ({ apiId: previousKey, newKey, value, mockValue }) => {
    if (mockValue) {
      store.updateWidgetMockConfig(Model.mockConfig, previousKey, newKey, mockValue)
    } else {
      store.deleteWidgetMockConfig(Model.mockConfig, newKey)
    }

    const widget = Widgets[value.type]
    if (!widget) {
      return console.log(`Could not find widget with type name "${value.type}". Please contact us!`)
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

  const onSelectSharedSlices = (keys) => {
    store.tab(tabId).replaceSharedSlices(keys)
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
          console.log({ tabProps: props })
          return (
            <div>hello</div>
          )
        }}
      </ModalFormCard>
    </Fragment>
  )
}

export default TabZone
