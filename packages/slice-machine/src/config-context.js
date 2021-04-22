import React from 'react'

export const ConfigContext = React.createContext({})

export default function ConfigContextProvider({ children, value }) {
  return (
    <ConfigContext.Provider value={value}>
      { typeof children === 'function' ? children(value) : children }
    </ConfigContext.Provider>
  )
}
