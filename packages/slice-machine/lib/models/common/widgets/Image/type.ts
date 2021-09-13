import { Field, FieldType } from '../../CustomType/fields'

interface Constraint { height?: number, width?: number }
interface ImageFieldConfig {
  label: string,
  constraint: Constraint
  thumbnails: ReadonlyArray<Constraint>
}
const defaultConfig = { label: '', constraint: {}, thumbnails: [] }

export class ImageField implements Field {
  config: ImageFieldConfig
  readonly type = FieldType.Image
  constructor(config: Partial<ImageFieldConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }
}