import * as t from 'io-ts'
import WidgetTypes from '../WidgetTypes'

const SeparatorConfig = t.exact(
  t.partial({
    label: t.string
  })
)
type SeparatorConfig = t.TypeOf<typeof SeparatorConfig>

const Separator = t.exact(
  t.intersection([
    t.type({
      type: t.literal(WidgetTypes.Separator)
    }),
    t.partial({
      config: SeparatorConfig
    })
  ])
)
type Separator = t.TypeOf<typeof Separator>

export default Separator
