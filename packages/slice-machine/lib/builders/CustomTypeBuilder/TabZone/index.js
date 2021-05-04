import { Fragment, useState } from 'react'
import * as Widgets from 'lib/models/common/widgets'
import EditModal from '../../common/EditModal'

import Zone from '../../common/Zone'

import { removeKeys } from 'lib/utils'
import { customTypeBuilderWidgetsArray } from 'lib/models/common/widgets/asArray'

import SliceZone from '../SliceZone'
import EmptyState from '../SliceZone/EmptyState'

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
    store
      .tab(tabId)
      .removeWidget(key)
  }

  const getFieldMockConfig = ({ apiId }) => {
    return Model.mockConfig?.[apiId]
  }

  const onDeleteTab = () => {
    store.tab(tabId).delete()
  }

  const onSaveNewField = ({ id, widgetTypeName }) => {
    console.log('ON SAVE NEW FIELD', widgetTypeName)
    const widget = Widgets[widgetTypeName]
    if (!widget) {
      console.log(`Could not find widget with type name "${widgetTypeName}". Please contact us!`)
    }
    store
      .tab(tabId)
      .addWidget(id, {
        type: widget.TYPE_NAME,
        [widget.customAccessor || 'config']: removeKeys(widget.create(id), ['id'])
      })
  }

  const onDragEnd = (result) => {
    if (!result.destination) {
      return
    }
    store.tab(tabId).reorderWidget(result.source.index, result.destination.index)
  }

  const onSave = ({ apiId, newKey, value, initialModelValues }, { initialMockConfig, mockValue }) => {
    if (mockValue && Object.keys(mockValue).length) {
      store
        .tab(tabId)
        .updateWidgetMockConfig(initialMockConfig, apiId, newKey, mockValue)
    } else {
      store
        .tab(tabId)
        .deleteWidgetMockConfig(initialMockConfig, apiId)
    }

    const widget = Widgets[initialModelValues.type]
    if (!widget) {
      console.log(`Could not find widget with type name "${initialModelValues.type}". Please contact us!`)
    }

    store
      .tab(tabId)
      .replaceWidget(
        apiId,
        newKey,
        {
          type: initialModelValues.type,
          [widget.customAccessor || 'config']: removeKeys(value, ['id', 'type'])
        }
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
      <Zone
        Model={Model}
        title={`${tabId} Tab`}
        dataTip={""}
        fields={fields}
        poolOfFieldsToCheck={Model.poolOfFieldsToCheck}
        showHints={showHints}
        EditModal={EditModal}
        widgetsArray={customTypeBuilderWidgetsArray}
        getFieldMockConfig={getFieldMockConfig}
        onDeleteItem={onDeleteItem}
        onSave={onSave}
        onSaveNewField={onSaveNewField}
        onDragEnd={onDragEnd}
        renderHintBase={({ item }) => `my.${tabId}.${item.key}`}
        renderFieldAccessor={(key) => `my.${tabId}.${key}`}
      />
      <button type="button" onClick={() => setModalIsOpen(true)}>edit modal</button>
      {
        Model.tabs.length > 1 ? (
          <button onClick={() => onDeleteTab()}>Delete Tab</button>
        ) : null
      }
      {
        sliceZone ? (
          <SliceZone
            tabId={tabId}
            sliceZone={sliceZone}
            onDelete={onDeleteSliceZone}
            onRemoveSharedSlice={onRemoveSharedSlice}
            onSelectSharedSlices={onSelectSharedSlices}
          />
        ): (
          < EmptyState onCreate={onCreateSliceZone} />
        )
      }
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
