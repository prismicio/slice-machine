import { Field, FieldType, SimpleField } from '../CustomType/fields'

export type AsArray = ReadonlyArray<{key: string, value: Field}>

export type AsObject = { [key: string]: Field }

const simpleField = { label: '', placeholder: '' }

export class BooleanField implements Field {
  config: SimpleField;
  readonly type = FieldType.Boolean;
  constructor(config = simpleField) {
    this.config = config
  }
}

export class ColorField implements Field {
  config: SimpleField;
  readonly type = FieldType.Color;
  constructor(config = simpleField) {
    this.config = config
  }
}

interface GroupConfig<T extends AsObject | AsArray> {
  label: string,
  placeholder: string,
  fields: T
}
export class GroupField<T extends AsObject | AsArray> implements Field {
  config: GroupConfig<T>
  readonly type = FieldType.Group
  constructor(config: GroupConfig<T>) {
    this.config = config
  }
}
