import { Field, FieldType, SimpleField } from '../../CustomType/fields'

export class UIDField implements Field {
  config: SimpleField;
  readonly type = FieldType.UID;
  constructor(config: Partial<SimpleField> = {}) {
    this.config = { ...SimpleField.default, ...config }
  }
}