import { Slice } from './Slice'
import { AsObject } from './Variation'

export interface ComponentInfo {
  sliceName: string
  fileName: string
  isDirectory: boolean
  extension: string
  model: {
    has: boolean,
    data: Slice<AsObject>
  }
  nameConflict: {
    sliceName: string;
    id: any;
} | undefined
  isCustomPreview: boolean
  hasPreview: Boolean
  previewUrl?: string
  meta: ComponentMetadata
  mock: { has: boolean, data: any }
}

export interface ComponentMetadata {
  id: string
  name?: string
  description?: string
}
export interface Component {
  from: string
  href: string
  pathToSlice: string
  infos: ComponentInfo
  model: Slice<AsObject>
  migrated: boolean
}