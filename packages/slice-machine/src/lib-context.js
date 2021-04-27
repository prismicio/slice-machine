import React from 'react'

export const LibContext = React.createContext([])

export default ({ children, value }) => (
  <LibContext.Provider value={value}>
    { children }
  </LibContext.Provider>
)
