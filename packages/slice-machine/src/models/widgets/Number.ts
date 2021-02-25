import * as t from 'io-ts'
import WidgetTypes from '../WidgetTypes'

const NumberConfig = t.exact(
  t.partial({
    label: t.string,
    placeholder: t.string,
    min: t.number,
    max: t.number,
    step: t.number
  })
)
type NumberConfig = t.TypeOf<typeof NumberConfig>

const Number = t.exact(
  t.intersection([
    t.type({
      type: t.literal(WidgetTypes.Number)
    }),
    t.partial({
      fieldset: t.string,
      config: NumberConfig
    })
  ])
)
type Number = t.TypeOf<typeof Number>

export default Number