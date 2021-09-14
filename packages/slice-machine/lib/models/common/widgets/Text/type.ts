import { Field, FieldType, SimpleField } from '../../CustomType/fields'

export class TextField implements Field {
  config: SimpleField;
  readonly type = FieldType.Text;
  constructor(config: Partial<SimpleField> = {}) {
    this.config = { ...SimpleField.default, ...config }
  }
}
