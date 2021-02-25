import * as t from 'io-ts'
import WidgetTypes from '../WidgetTypes'

const RangeConfig = t.exact(
  t.partial({
    label: t.string,
    placeholder: t.string,
    min: t.number,
    max: t.number,
    step: t.number,
  })
)
type RangeConfig = t.TypeOf<typeof RangeConfig>

const Range = t.exact(
  t.intersection([
    t.type({
      type: t.literal(WidgetTypes.Range)
    }),
    t.partial({
      fieldset: t.string,
      config: RangeConfig
    })
  ])
)
type Range = t.TypeOf<typeof Range>

export default Range