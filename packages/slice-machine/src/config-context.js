import React from 'react'

export const ConfigContext = React.createContext({})

export default ({ children, value }) => (
  <ConfigContext.Provider value={value}>
    { typeof children === 'function' ? children(value) : children }
  </ConfigContext.Provider>
)
