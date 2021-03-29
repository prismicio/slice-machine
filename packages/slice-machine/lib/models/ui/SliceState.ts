import Slice from '../common/Slice'
import { Variation, AsObject, AsArray } from '../common/Variation'
import { ComponentInfo, Preview } from '../common/Component'
import { LibStatus } from '../common/Library'

interface SliceState {
  jsonModel: Slice<AsObject>

  from: string
  href: string
  pathToSlice: string
  infos: ComponentInfo
  migrated: boolean
  
  mockConfig: any
  initialMockConfig: any
  
  remoteVariations: ReadonlyArray<Variation<AsArray>>
  initialVariations: ReadonlyArray<Variation<AsArray>>
  variations: ReadonlyArray<Variation<AsArray>>
  
  initialPreviewUrls?: {
    [variationId: string]: Preview
  }

  isTouched?: boolean
  __status?: LibStatus
}

const SliceState = {
  
  variation(state: SliceState, variationId?: string): Variation<AsArray> | undefined {
    if(state.variations.length) {
      if(variationId) return state.variations.find(v => v.id === variationId)
      return state.variations[0]
    }
  },

  updateVariation(state: SliceState, variationId: string) {
    return (mutate: (v: Variation<AsArray>) => Variation<AsArray>): SliceState => {
      const variations = state.variations.map(v => {
        if(v.id === variationId) return mutate(v)
        else return v
      })

      return {
        ...state,
        variations
      }
    }
  }
}

export default SliceState