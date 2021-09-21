import { Field, FieldType, SimpleField } from "../../CustomType/fields";

export class EmbedField implements Field {
  config: SimpleField;
  readonly type = FieldType.Embed;
  constructor(config: Partial<SimpleField> = {}) {
    this.config = { ...SimpleField.default, ...config };
  }
}
