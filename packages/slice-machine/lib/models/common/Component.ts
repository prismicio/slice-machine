import { Slice } from './Slice'
import { AsObject } from './Variation'

export interface ComponentInfo {
  sliceName: string
  fileName: string
  isDirectory: boolean
  extension: string
  model: Slice<AsObject>
  nameConflict: {
    sliceName: string
    id: any
  } | undefined
  
  previewUrls?: {
    [variationId: string]: Preview
  }
  meta: ComponentMetadata
  mock: { has: boolean, data: any }
}

export const ComponentInfo = {
  hasPreviewsMissing(infos: ComponentInfo): boolean {
    const previews = infos.previewUrls
    if(!previews) return true

    return Object.entries(previews).reduce((acc: boolean, [, preview]: [string, Preview]) => {
      return Boolean(!preview) || (acc && preview?.hasPreview)
    }, false)
  }
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

export interface Preview {
  isCustomPreview: boolean
  hasPreview: boolean
  url?: string
}