import * as t from 'io-ts'
import { either } from 'fp-ts/lib/Either'
import WidgetTypes from '../WidgetTypes'
import ImageConstraint from '../shared/ImageConstraint'

const options = [
  'heading1',
  'heading2',
  'heading3',
  'heading4',
  'heading5',
  'heading6',
  'paragraph',
  'strong',
  'em',
  'preformatted',
  'hyperlink',
  'image',
  'embed',
  'list-item',
  'o-list-item',
  'rtl'
];

const RichTextOptions = new t.Type<string, string, unknown>(
  'RichTextOptions',
  (u: unknown): u is string => typeof u === 'string',
  (u: unknown, context: t.Context) => {
    return either.chain(t.string.validate(u as unknown, context), (s) => {
      const entries = s.split(',').map((e: string) => e.trim())
      const isValid = entries.reduce((acc: boolean, entry: string) => {
        if(acc && options.includes(entry)) return true;
        else return false;
      }, true);
      if(isValid) return t.success(s)
      else return t.failure(u, context)
    });
  },
  a => a
)

const RichTextConfig = t.exact(
  t.partial({
    label: t.string,
    placeholder: t.string,
    useAsTitle: t.boolean,
    single: RichTextOptions,
    multi: RichTextOptions,
    imageConstraint: ImageConstraint,
    labels: t.array(t.string),
    allowTargetBlank: t.boolean
  })
)
type RichTextConfig = t.TypeOf<typeof RichTextConfig>

const RichText = t.exact(
  t.intersection([
    t.type({
      type: t.literal(WidgetTypes.RichText)
    }),
    t.partial({
      fieldset: t.string,
      config: RichTextConfig
    })
  ])
)
type RichText = t.TypeOf<typeof RichText>

export default RichText
