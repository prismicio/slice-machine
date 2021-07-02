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
  UID = 'UID',

  SliceZone = 'SliceZone',

  SharedSlice = 'SharedSlice'
}

export interface BaseConfig { label: string }

export interface SimpleField extends BaseConfig {
  placeholder: string
}

export interface Field {
  type: FieldType
  config: BaseConfig
}