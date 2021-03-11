import { Slice } from '../common/Slice'
import { Variation, AsObject, AsArray } from '../common/Variation'
import { ComponentInfo } from '../common/Component'
import { LibStatus } from '../common/Library'

export default interface SliceState {
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
  
  initialPreviewUrl?: string

  isTouched?: boolean
  __status?: LibStatus
}