import * as t from 'io-ts'
import WidgetTypes from '../WidgetTypes'

const EmbedConfig = t.exact(
  t.partial({
    label: t.string,
    placeholder: t.string,
    useAsTitle: t.boolean
  })
)
type EmbedConfig = t.TypeOf<typeof EmbedConfig>

const Embed = t.exact(
  t.intersection([
    t.type({
      type: t.literal(WidgetTypes.Embed)
    }),
    t.partial({
      fieldset: t.string,
      config: EmbedConfig
    })
  ])
)
type Embed = t.TypeOf<typeof Embed>

export default Embed