import React from 'react'
import { useModelReducer } from '../slice/context'

import Environment from '../../../lib/models/common/Environment'
import { Library } from '../../../lib/models/common/Library'
import Slice from '../../../lib/models/common/Slice'
import { AsObject } from '../../../lib/models/common/Variation'

import LibraryState from '../../../lib/models/ui/LibraryState'

export const LibrariesContext = React.createContext<Partial<ReadonlyArray<LibraryState>>>([])

export default ({ children, libraries, remoteSlices, env }: {
  children: any,
  libraries: ReadonlyArray<Library>,
  env: Environment,
  remoteSlices?: ReadonlyArray<Slice<AsObject>>
}) => {
  const models: ReadonlyArray<LibraryState> = libraries.map((lib) => {
    return {
      name: lib.name,
      components: lib.components.map(component => useModelReducer({
        slice: component,
        mockConfig: env.mockConfig[component.infos.sliceName] || {},
        remoteSlice: remoteSlices?.find(e => e.id === component.model.id),
      }))
    }
  })

  return (
    <LibrariesContext.Provider value={models}>
      { children }
    </LibrariesContext.Provider>
  )
}
  
