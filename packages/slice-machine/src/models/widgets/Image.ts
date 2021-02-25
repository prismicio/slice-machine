import * as t from 'io-ts'
import WidgetTypes from '../WidgetTypes'
import ImageConstraint from '../shared/ImageConstraint'

const Thumbnail = t.exact(
  t.intersection([
    t.type({
      name: t.string
    }),
    t.partial({
      width: t.union([t.number, t.null]),
      height: t.union([t.number, t.null])
    })
  ])
)
type Thumbnail = t.TypeOf<typeof Thumbnail>

const ImageConfig = t.exact(
  t.partial({
    label: t.string,
    placeholder: t.string,
    constraint: ImageConstraint,
    thumbnails: t.array(Thumbnail)
  })
)
type ImageConfig = t.TypeOf<typeof ImageConfig>


const Image = t.exact(
  t.intersection([
    t.type({
      type: t.literal(WidgetTypes.Image)
    }),
    t.partial({
      fieldset: t.string,
      config: ImageConfig
    })
  ])
)
type Image = t.TypeOf<typeof Image>

export default Image