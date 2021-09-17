import { Field, FieldType, SimpleField } from '../../CustomType/fields'

export class DateField implements Field {
  config: SimpleField;
  readonly type = FieldType.Date;
  constructor(config: Partial<SimpleField> = {}) {
    this.config = { ...SimpleField.default, ...config }
  }
}
