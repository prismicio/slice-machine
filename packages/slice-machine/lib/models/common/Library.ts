import equal from 'fast-deep-equal'
import { pascalize } from 'sm-commons/utils/str'

import { Slice } from './Slice'
import { AsObject } from './Variation'
import { Component, ComponentInfo } from './Component'


export enum LibStatus {
  Modified = 'MODIFIED',
  Synced = 'SYNCED',
  PreviewMissing = 'PREVIEW_MISSING',
  Invalid = 'INVALID',
  NewSlice = 'NEW_SLICE'
}

export interface Library {
  name: string
  components: ReadonlyArray<ComponentWithLibStatus>
}

export const Library = {
  withStatus: function (lib: Library, remoteSlices: ReadonlyArray<Slice<AsObject>>): Library {
    const components = lib.components.map((component: Component) => {
      const sliceFound = remoteSlices.find(slice => component.infos.sliceName === pascalize(slice.id))
      const __status = (() => {
        const hasPreviewsMissing = ComponentInfo.hasPreviewsMissing(component.infos)
        if (hasPreviewsMissing) {
          return LibStatus.PreviewMissing
        }
        // try {
        //   sliceSchema.validateSync(component)
        // } catch (e) { LibStatus.Invalid }
        
        if (!sliceFound) {
          return LibStatus.NewSlice
        }
        return !equal(component.model.variations, sliceFound.variations) ? LibStatus.Modified : LibStatus.Synced
      })();

      return {
        ...component,
        __status
      }
    })

    return {
      name: lib.name,
      components
    }
  }
}

export type ComponentWithLibStatus = Component & ({ __status: LibStatus } | {})

