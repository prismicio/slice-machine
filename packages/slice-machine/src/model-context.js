import React, { useState } from 'react'
import createModel from '../lib/model'

export const ModelContext = React.createContext([])

export default ({ children, initialModel, info }) => {
  const [Model, setModel] = useState(createModel(initialModel, info))
  
  const hydrate = (fn) => {
    if (fn && typeof fn === 'function') {
      fn()
    }
    setModel({ ...Model, ...Model.get() })
  }

  const value = {
    ...Model,
    ...Model.get(),
    hydrate,
  }
  return (
    <ModelContext.Provider value={value}>
      { typeof children === 'function' ? children(value) : children }
    </ModelContext.Provider>
  )
}
