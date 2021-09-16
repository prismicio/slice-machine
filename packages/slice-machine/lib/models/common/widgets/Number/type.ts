import { Field, FieldType, SimpleField } from '../../CustomType/fields'

export class NumberField implements Field {
  config: SimpleField;
  readonly type = FieldType.Number;
  constructor(config: Partial<SimpleField> = {}) {
    this.config = { ...SimpleField.default, ...config }
  }
}
