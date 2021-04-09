import { Field, FieldType } from './fields'

interface SharedSlice {
  type: FieldType.SharedSlice
}

export interface SliceZone extends Field {
  type: FieldType.SliceZone
  fieldset: string
  config: {
    choices: {
      [x: string]: SharedSlice
    }
  }
}

export interface SliceZoneAsArray {
  key: string
  value: ReadonlyArray<{key: string, value: { type: FieldType.SharedSlice } }>
}

export const SliceZone = {
  toArray(key: string, sz: SliceZone): SliceZoneAsArray {
    return {
      key,
      value: Object.entries(sz.config.choices).map(([key, value]) => ({
        key,
        value
      }))
    }
  },
  toObject(sz: SliceZoneAsArray): SliceZone {
    return {
      type: FieldType.SliceZone,
      fieldset: 'Slice Zone',
      config: {
        choices: sz.value.reduce((acc, curr) => ({
          ...acc,
          [curr.key]: curr.value
        }), {})
      }
    }
  },
  createEmpty(): SliceZone {
    return {
      type: FieldType.SliceZone,
      fieldset: 'Slice Zone',
      config: {
        choices: {}
      }
    }
  }
}