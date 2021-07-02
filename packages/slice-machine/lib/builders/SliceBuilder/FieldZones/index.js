import { Fragment } from 'react'
import { Box } from 'theme-ui'

import { ensureDnDDestination } from 'lib/utils'

import Zone from '../../common/Zone'
import EditModal from '../../common/EditModal'

import * as Widgets from 'lib/models/common/widgets'
import sliceBuilderWidgetsArray from 'lib/models/common/widgets/sliceBuilderArray'

import { SliceMockConfig } from '../../../models/common/MockConfig'

const dataTipText = ` The non-repeatable zone
  is for fields<br/> that should appear once, like a<br/>
  section title.
`
const dataTipText2 = `The repeatable zone is for a group<br/>
  of fields that you want to be able to repeat an<br/>
  indeterminate number of times, like FAQs`

const Zones = ({
  Model,
  store,
  variation,
  showHints,
}) => {
  
  const _onDeleteItem = (widgetArea) => (key) => {
    store
      .variation(variation.id)
      .deleteWidgetMockConfig(Model.mockConfig, widgetArea, key)
    store
      .variation(variation.id)
      .removeWidget(widgetArea, key)
  }

  const _getFieldMockConfig = (widgetArea) => ({ apiId }) => {
    return SliceMockConfig.getFieldMockConfig(Model.mockConfig, variation.id, widgetArea, apiId)
  }

  const _onSave = (widgetArea) => ({ apiId: previousKey, newKey, value, mockValue }) => {
    if (mockValue) {
      store
        .variation(variation.id)
        .updateWidgetMockConfig(Model.mockConfig, widgetArea, previousKey, newKey, mockValue)
    } else {
      store
        .variation(variation.id)
        .deleteWidgetMockConfig(Model.mockConfig, widgetArea, newKey)
    }
    store
      .variation(variation.id)
      .replaceWidget(widgetArea, previousKey, newKey, value)

  }

  const _onSaveNewField = (fieldType) => ({ id, widgetTypeName }) => {
    const widget = Widgets[widgetTypeName]
    if (!widget) {
      console.log(`Could not find widget with type name "${widgetTypeName}". Please contact us!`)
    }
    store
      .variation(variation.id)
      .addWidget(fieldType, id, widget.create())
  }

  const _onDragEnd = (fieldType) => (result) => {
    if (ensureDnDDestination(result)) {
      return
    }
    store
      .variation(variation.id)
      .reorderWidget(fieldType, result.source.index, result.destination.index)
  }

  return (
    <Fragment>
      {/* { JSON.stringify(Model.mockConfig) } */}
      <Zone
        Model={Model}
        title="Non-Repeatable zone"
        dataTip={dataTipText}
        fields={variation.primary}
        showHints={showHints}
        EditModal={EditModal}
        widgetsArray={sliceBuilderWidgetsArray}
        getFieldMockConfig={_getFieldMockConfig('primary')}
        onDeleteItem={_onDeleteItem('primary')}
        onSave={_onSave('primary')}
        onSaveNewField={_onSaveNewField('primary')}
        onDragEnd={_onDragEnd('primary')}
        poolOfFieldsToCheck={variation.primary || []}
        renderHintBase={({ item }) => `slice.primary.${item.key}`}
        renderFieldAccessor={(key) => `slice.primary.${key}`}
      />
      <Box mt={4} />
      <Zone
        isRepeatable
        Model={Model}
        title="Repeatable zone"
        dataTip={dataTipText2}
        widgetsArray={sliceBuilderWidgetsArray}
        fields={variation.items}
        showHints={showHints}
        EditModal={EditModal}
        getFieldMockConfig={_getFieldMockConfig('items')}
        onDeleteItem={_onDeleteItem('items')}
        onSave={_onSave('items')}
        onSaveNewField={_onSaveNewField('items')}
        onDragEnd={_onDragEnd('items')}
        poolOfFieldsToCheck={variation.items || []}
        renderHintBase={({ item }) => `item.${item.key}`}
        renderFieldAccessor={(key) => `slice.items[i].${key}`}
      />
    </Fragment>
  )

}

export default Zones
