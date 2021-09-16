import { Field, FieldType, SimpleField } from '../../CustomType/fields'

export class ColorField implements Field {
  config: SimpleField;
  readonly type = FieldType.Color;
  constructor(config: Partial<SimpleField> = {}) {
    this.config = { ...SimpleField.default, ...config }
  }
}
