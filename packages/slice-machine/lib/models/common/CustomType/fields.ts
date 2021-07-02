export enum FieldType {
  Boolean = 'Boolean',
  GeoPoint = 'GeoPoint',
  Select = 'Select',
  Color = 'Color',
  Group = 'Group',
  StructuredText = 'StructuredText',
  ContentRelationship = 'Link',
  Image = 'Image',
  Text = 'Text',
  Date = 'Date',
  Link = 'Link',
  Timestamp = 'Timestamp',
  Embed = 'Embed',
  Number = 'Number',
  UID = 'UID',

  SliceZone = 'Slices',

  SharedSlice = 'SharedSlice'
}


export interface SimpleField {
  label: string
  placeholder: string
}

export interface Field {
  type: FieldType
  fieldset?: string
  config: {}
}