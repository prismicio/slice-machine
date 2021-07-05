import { Field, FieldType, SimpleField } from '../CustomType/fields'
import { SliceZone } from '../CustomType/sliceZone';

import { optionValues } from './StructuredText/options'

export type AsArray = ReadonlyArray<{key: string, value: Field}>

export type AsObject = { [key: string]: Field | SliceZone }

const simpleField = { label: '', placeholder: '' }

export class BooleanField implements Field {
  config: {
    label: string,
    placeholder_false: string,
    placeholder_true: string,
    default_value: boolean
  };
  readonly type = FieldType.Boolean;
  constructor(config = { label: '', placeholder_false: 'false', placeholder_true: 'true', default_value: false }) {
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

export class ContentRelationshipField implements Field {
  config: {
    label: string,
    select: string,
    customtypes: Array<string>
  };
  readonly type = FieldType.ContentRelationship;
  constructor(config = { label: '', select: 'document', customtypes: [] }) {
    this.config = config
  }
}

export class DateField implements Field {
  config: SimpleField;
  readonly type = FieldType.Date;
  constructor(config = simpleField) {
    this.config = config
  }
}

export class EmbedField implements Field {
  config: SimpleField;
  readonly type = FieldType.Embed;
  constructor(config = simpleField) {
    this.config = config
  }
}

export class GeoPointField implements Field {
  config: SimpleField;
  readonly type = FieldType.GeoPoint;
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

interface Constraint { height?: number, width?: number }

export class ImageField implements Field {
  config: {
    label: string,
    constraint: Constraint
    thumbnails: ReadonlyArray<Constraint>
  }
  readonly type = FieldType.Image
  constructor(config = { label: '', constraint: {}, thumbnails: [] }) {
    this.config = config
  }
}

enum Media {
  media = 'media',
  document = 'document',
  web = 'web'
}
export class LinkField implements Field {
  config: {
    label: string,
    useAsTitle?: boolean,
    placeholder: string,
    select: Media,
    customtypes?: ReadonlyArray<string>,
    masks?: ReadonlyArray<string>,
    tags?: ReadonlyArray<string>,
    allowTargetBlank: boolean
  };
  readonly type = FieldType.Link;
  constructor(config = { ...simpleField, select: Media.web, allowTargetBlank: false }) {
    this.config = config
  }
}

export class NumberField implements Field {
  config: SimpleField;
  readonly type = FieldType.Number;
  constructor(config = simpleField) {
    this.config = config
  }
}

export class SelectField implements Field {
  config: {
    label: string,
    placeholder: string,
    options: Array<string>
    default_value?: string
  }
  readonly type = FieldType.Select
  constructor(config = { ...simpleField, options: ['1', '2'] }) {
    this.config = config
  }
}

export class StructuredTextField implements Field {
  config: {
    label: string,
    placeholder: string,
    single?: string
    multi?: string
    allowTargetBlank: boolean
  }
  readonly type = FieldType.StructuredText
  constructor(config = {
    ...simpleField,
    allowTargetBlank: true,
    single: optionValues.join(',')
  }) {
    this.config = config
  }
}

export class TextField implements Field {
  config: SimpleField;
  readonly type = FieldType.Text;
  constructor(config = simpleField) {
    this.config = config
  }
}

export class TimestampField implements Field {
  config: SimpleField;
  readonly type = FieldType.Timestamp;
  constructor(config = simpleField) {
    this.config = config
  }
}

export class UIDField implements Field {
  config: SimpleField;
  readonly type = FieldType.UID;
  constructor(config = simpleField) {
    this.config = config
  }
}