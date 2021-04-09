import { Fragment } from 'react'
import * as Widgets from 'lib/models/common/widgets'
import EditModal from '../../common/EditModal'

import Zone from '../../common/Zone'

import { removeKeys } from 'lib/utils'
import { customTypeBuilderWidgetsArray } from 'lib/models/common/widgets/asArray'

import SliceZone from '../SliceZone'

const TabZone = ({
  Model,
  store,
  tabId,
  fields,
  sliceZone,
  showHints,
}) => {

  const onDeleteItem = (key) => {
    store
      .tab(tabId)
      .removeWidget(key)
  }

  const getFieldMockConfig = ({ apiId }) => {
    return Model.mockConfig?.[apiId]
  }

  const onSaveNewField = ({ id, widgetTypeName }) => {
    const widget = Widgets[widgetTypeName]
    if (!widget) {
      console.log(`Could not find widget with type name "${widgetTypeName}". Please contact us!`)
    }
    store
      .tab(tabId)
      .addWidget(id, {
        type: widgetTypeName,
        [widget.customAccessor || 'config']: removeKeys(widget.create(id), ['id'])
      })
  }

  const onDragEnd = (result) => {
    console.log({
      result
    })
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
      <SliceZone
        sliceZone={sliceZone}
        onDelete={onDeleteSliceZone}
        onCreate={onCreateSliceZone}
      />
    </Fragment>
  )
}

export default TabZone
