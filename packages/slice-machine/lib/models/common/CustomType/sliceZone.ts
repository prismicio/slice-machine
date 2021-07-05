const SharedSliceType = 'SharedSlice'

interface SharedSlice {
  type: string
}

export type SliceZoneType = 'Slices'
export const sliceZoneType: SliceZoneType = 'Slices'

export interface SliceZone {
  type: SliceZoneType
  fieldset: string
  config: {
    choices: {
      [x: string]: SharedSlice
    }
  }
}

export interface SliceZoneAsArray {
  key: string
  value: ReadonlyArray<{key: string, value: SharedSlice }>
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
    return {
      ...sz,
      value: [...sz.value, {
        key,
        value: {
          type:  SharedSliceType
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
          type: SharedSliceType
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