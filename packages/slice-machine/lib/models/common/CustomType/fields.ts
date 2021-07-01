export enum FieldType {
  Boolean = 'Boolean',
  GeoPoint = 'GeoPoint',
  Select = 'Select',
  Color = 'Color',
  Group = 'Group',
  StructuredText = 'StructuredText',
  ContentRelationship = 'ContentRelationship',
  Image = 'Image',
  Text = 'Text',
  Date = 'Date',
  Link = 'Link',
  Timestamp = 'Timestamp',
  Embed = 'Embed',
  Number = 'Number',
  UID = 'UID'
}

export interface BaseConfig { label: string }

export interface SimpleField extends BaseConfig {
  placeholder: string
}

export interface AbstractField {
  type: FieldType
  config: BaseConfig
}