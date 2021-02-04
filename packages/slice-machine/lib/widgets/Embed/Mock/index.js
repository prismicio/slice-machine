import dataset from './dataset'

export const initialValues = null

export const handleMockConfig = () => {
  return dataset[Math.floor(Math.random() * dataset.length)].oembed
}

export const handleMockContent = (v) => {
  if (typeof v === 'object' && v.url && v.oembed) {
    return v.oembed
  }
  return handleMockConfig()
}
