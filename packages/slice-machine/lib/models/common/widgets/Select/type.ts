import { Field, FieldType, SimpleField } from '../../CustomType/fields'

interface SelectFieldConfig {
  label: string,
  placeholder: string,
  options: Array<string>
  default_value?: string
}

const defaultConfig = { ...SimpleField.default, options: ['1', '2'] }

export class SelectField implements Field {
  config: SelectFieldConfig
  readonly type = FieldType.Select
  constructor(config: Partial<SelectFieldConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }
}
