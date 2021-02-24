import React from 'react'

export const LibrariesContext = React.createContext([])

export default ({ children, value }) => {
  const { libraries, env, remoteSlices } = value
  const models = libraries.map(([libName, slices]) => {
    return [
      libName,
      slices.map(slice => ({
        slice,
        remoteSlice: remoteSlices.find(e => e.id === slice.id),
        mockConfig: env.mockConfig[slice.sliceName]
      }))
    ]
  })
  return (
    <LibrariesContext.Provider value={models}>
      { children }
    </LibrariesContext.Provider>
  )
}
