import places from './places'
import { createDefaultHandleMockContentFunction } from '../../../../utils'

export const initialValues = null

export const handleMockConfig = () => {
  const randomPlace = places[Math.floor(Math.random() * places.length)]
  return randomPlace.points
}

export const handleMockContent = createDefaultHandleMockContentFunction(
  { handleMockConfig },
  'GeoPoint',
  (v) => v && v.latitude && v.longitude
)
