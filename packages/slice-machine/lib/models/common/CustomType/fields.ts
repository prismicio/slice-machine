export enum FieldType {
  SliceZone = 'Slices',
  Slice = 'Slice',
  SharedSlice = 'SharedSlice',
  Group = 'Group',
  Uid = 'UID',
}

export interface Field {
  type: FieldType
}


