import * as t from 'io-ts'
import WidgetTypes from '../WidgetTypes'

const TimestampConfig = t.exact(
  t.partial({
    label: t.string,
    placeholder: t.string,
    default: t.string
  })
)
type TimestampConfig = t.TypeOf<typeof TimestampConfig>

const Timestamp = t.exact(
  t.intersection([
    t.type({
      type: t.literal(WidgetTypes.Timestamp)
    }),
    t.partial({
      fieldset: t.string,
      config: TimestampConfig
    })
  ])
)
type Timestamp = t.TypeOf<typeof Timestamp>

export default Timestamp