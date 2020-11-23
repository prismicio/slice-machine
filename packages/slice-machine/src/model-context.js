import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useIsMounted } from 'react-tidy'

import createModel from '../lib/model'

export const ModelContext = React.createContext([])

export default function ModelProvider({ children, initialModel, info }) {
  const isMounted = useIsMounted()
  const [Model, setModel] = useState(createModel(initialModel, info))
  
  const hydrate = (fn) => {
    if (fn && typeof fn === 'function') {
      fn()
    }
    if (isMounted) {
      setModel({ ...Model, ...Model.get() })
    }
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

export const ModelHandler = ({ libraries, children }) => {
  const router = useRouter()
  if (!router.query || !router.query.lib) {
    return children
  }
  const lib = libraries.find(e => e[0] === router.query.lib.replace(/--/g, "/"))
  if (!lib) {
    router.replace('/')
    return null
  }

  const component = lib[1].find(e => e.sliceName === router.query.sliceName)

  if (!component) {
    router.replace('/')
    return null
  }

  const { model: initialModel } = component

  return (
    <ModelProvider initialModel={initialModel} info={component}>
      { children }
    </ModelProvider>
  )
  return children
}
