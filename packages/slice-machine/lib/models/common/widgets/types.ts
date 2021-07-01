import { AbstractField, FieldType, SimpleField } from '../CustomType/fields'

const simpleField = { label: '', placeholder: '' }

export class BooleanField implements AbstractField<FieldType.Boolean> {
  config: SimpleField
  constructor(readonly type = FieldType.Boolean, config = simpleField) {
    this.config = config
  }
}

export class ColorField implements AbstractField {
  config: SimpleField
  constructor(readonly type = FieldType.Color, config = simpleField) {
    this.config = config
  }
}


// export interface ContentRelationship extends Field<FieldType.ContentRelationship, {
//   label: string,
//   select: string,
//   customtypes: ReadonlyArray<string>
// }> {}