export enum SliceType {
  SharedSlice = 'SharedSlice',
  Slice = 'Slice'
}

export interface SharedSlice {
  type: SliceType.SharedSlice
}

export interface NonSharedSlice {
  type: SliceType.Slice
}

export interface NonSharedSliceInSliceZone {
  key: string,
  value: {
    type: SliceType.Slice,
    [x: string]: any
  }
}

export type SliceZoneType = 'Slices'
export const sliceZoneType: SliceZoneType = 'Slices'

export interface SliceZone {
  type: SliceZoneType
  fieldset: string
  config: {
    choices: {
      [x: string]: SharedSlice | NonSharedSlice
    }
  }
}

export interface SliceZoneAsArray {
  key: string
  value: ReadonlyArray<{key: string, value: SharedSlice | NonSharedSlice }>
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
      type: sliceZoneType,
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
    if (sz.value.find(e => e.key === key)) {
      return sz
    }
    return {
      ...sz,
      value: [...sz.value, {
        key,
        value: {
          type:  SliceType.SharedSlice
        }
      }]
    }
  },
  replaceSharedSlice(sz: SliceZoneAsArray, keys: [string]): SliceZoneAsArray {
    return {
      ...sz,
      value: keys.map(key => ({
        key,
        value:  {
          type: SliceType.SharedSlice
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
      type: sliceZoneType,
      fieldset: 'Slice Zone',
      config: {
        choices: {}
      }
    }
  }
}