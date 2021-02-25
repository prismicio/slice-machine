import * as t from 'io-ts'
import WidgetTypes from '../WidgetTypes'

const SelectConfig = t.exact(
  t.partial({
    label: t.string,
    placeholder: t.string,
    defaultValue: t.string,
    options: t.array(t.string)
  })
)
type SelectConfig = t.TypeOf<typeof SelectConfig>

const Select = t.exact(
  t.intersection([
    t.type({
      type: t.literal(WidgetTypes.Select)
    }),
    t.partial({
      fieldset: t.string,
      config: SelectConfig
    })
  ])
)
type Select = t.TypeOf<typeof Select>

export default Select

