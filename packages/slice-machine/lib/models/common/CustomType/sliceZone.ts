import { FieldType } from './fields'

interface SharedSlice {
  type: FieldType.SharedSlice
}

export interface SliceZone {
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
  addSharedSlice(sz: SliceZoneAsArray, key: string): SliceZoneAsArray {
    return {
      ...sz,
      value: [...sz.value, {
        key,
        value: {
          type:  FieldType.SharedSlice
        }
      }]
    }
  },
  replaceSharedSlice(sz: SliceZoneAsArray, keys: [string]): SliceZoneAsArray {
    return {
      ...sz,
      value: keys.map(key =>({
        key,
        value:  {
          type: FieldType.SharedSlice
        }
      }))
    }
  },
  removeSharedSlice(sz: SliceZoneAsArray, key: string): SliceZoneAsArray {
    return {
      ...sz,
      value: sz.value.filter(e => e.key !== key)
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