import * as t from 'io-ts'
import WidgetTypes from '../WidgetTypes'

const IntegrationFieldConfig = t.exact(
  t.partial({
    label: t.string,
    placeholder: t.string,
    catalog: t.string
  })
)
type IntegrationFieldConfig = t.TypeOf<typeof IntegrationFieldConfig>

const IntegrationField = t.exact(
  t.intersection([
    t.type({
      type: t.literal(WidgetTypes.IntegrationField)
    }),
    t.partial({
      fieldset: t.string,
      config: IntegrationFieldConfig
    })
  ])
)
type IntegrationField = t.TypeOf<typeof IntegrationField>

export default IntegrationField
