import * as t from 'io-ts'
import WidgetTypes from '../WidgetTypes'

const GeoPointConfig = t.exact(
  t.partial({
    label: t.string
  })
)
type GeoPointConfig = t.TypeOf<typeof GeoPointConfig>

const GeoPoint = t.exact(
  t.intersection([
    t.type({
      type: t.literal(WidgetTypes.GeoPoint)
    }),
    t.partial({
      fieldset: t.string,
      config: GeoPointConfig
    })
  ])
)
type GeoPoint = t.TypeOf<typeof GeoPoint>

export default GeoPoint