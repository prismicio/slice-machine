import { Field, FieldType, SimpleField } from '../../CustomType/fields'

export class TimestampField implements Field {
  config: SimpleField;
  readonly type = FieldType.Timestamp;
  constructor(config: Partial<SimpleField> = {}) {
    this.config = { ...SimpleField.default, ...config }
  }
}
