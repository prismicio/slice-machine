import * as t from 'io-ts'
import WidgetTypes from '../WidgetTypes'

const TextConfig = t.exact(
  t.partial({
    label: t.string,
    useAsTitle: t.boolean,
    placeholder: t.string
  })
)
type TextConfig = t.TypeOf<typeof TextConfig>

const Text = t.exact(
  t.intersection([
    t.type({
      type: t.literal(WidgetTypes.Text)
    }),
    t.partial({
      fieldset: t.string,
      config: TextConfig
    })
  ])
)
type Text = t.TypeOf<typeof Text>

export default Text
