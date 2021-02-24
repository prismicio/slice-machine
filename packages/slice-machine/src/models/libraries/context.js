import React from 'react'
import { useModelReducer } from '../slice/context'

export const LibrariesContext = React.createContext([])

export default ({ children, value }) => {
  const { libraries, env, remoteSlices } = value
  const models = libraries.map(([libName, slices]) => {
    return [
      libName,
      slices.map(slice => useModelReducer({
        slice,
        remoteSlice: remoteSlices.find(e => e.id === slice.id),
      }))
    ]
  })
  return (
    <LibrariesContext.Provider value={models}>
      { children }
    </LibrariesContext.Provider>
  )
}


/**
 *({
 slice,
 remoteSlice: remoteSlices.find(e => e.id === slice.id),
 mockConfig: env.mockConfig[slice.sliceName]
 }))
 */