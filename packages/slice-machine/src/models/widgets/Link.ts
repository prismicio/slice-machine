import * as t from 'io-ts'
import WidgetTypes from '../WidgetTypes'

const LinkConfig = t.exact(
  t.partial({
    label: t.string,
    useAsTitle: t.boolean,
    placeholder: t.string,
    select: t.union([
      t.literal('media'),
      t.literal('document'),
      t.literal('web')
    ]),
    customtypes: t.array(t.string), // `customtypes` and `masks` are alternatives
    masks: t.array(t.string),
    tags: t.array(t.string),
    allowTargetBlank: t.boolean
  })
)
type LinkConfig = t.TypeOf<typeof LinkConfig>

const Link = t.exact(
  t.intersection([
    t.type({
      type: t.literal(WidgetTypes.Link)
    }),
    t.partial({
      fieldset: t.string,
      config: LinkConfig
    })
  ])
)
type Link = t.TypeOf<typeof Link>

export default Link
