import * as t from 'io-ts'
import WidgetTypes from '../WidgetTypes'

const DateConfig = t.exact(
  t.partial({
    label: t.string,
    placeholder: t.string,
    default: t.string
  })
)
type DateConfig = t.TypeOf<typeof DateConfig>

const Date = t.exact(
  t.intersection([
    t.type({
      type: t.literal(WidgetTypes.Date)
    }),
    t.partial({
      fieldset: t.string,
      config: DateConfig
    })
  ])
)
type Date = t.TypeOf<typeof Date>

export default Date