import React, { useEffect, useState } from 'react'
import equal from 'fast-deep-equal'
import { useRouter } from 'next/router'
import { useIsMounted } from 'react-tidy'

import { useModelReducer } from '../lib/model2'

export const ModelContext = React.createContext([])

export default function ModelProvider({ children, initialModel, remoteSlice, initialMockConfig, info }) {
  const isMounted = useIsMounted()
  const [Model, dispatch] = useModelReducer(initialModel, remoteSlice, info, initialMockConfig)
  // const [Model, setModel] = useState(createModel(initialModel, remoteSlice, info, initialMockConfig))

  // useEffect(() => {
  //   if (equal(Model.get().mockConfig, initialMockConfig)) {
  //     setModel(createModel(initialModel, remoteSlice, info, initialMockConfig))
  //   }
  // }, [initialMockConfig])
  
  const hydrate = (fn) => {
    if (fn && typeof fn === 'function') {
      const res = fn()
      console.log({ res })
    }
    if (isMounted) {
      setModel({ ...Model, })
    }
  }

  const value = {
    ...Model,
    hydrate,
    dispatch
  }

  return (
    <ModelContext.Provider value={value}>
      { typeof children === 'function' ? children(value) : children }
    </ModelContext.Provider>
  )
}

export const ModelHandler = ({ libraries, remoteSlices, env, children }) => {
  const router = useRouter()
  if (!router.query || !router.query.lib) {
    return children
  }
  const lib = libraries.find(e => e[0] === router.query.lib.replace(/--/g, "/"))
  if (!lib) {
    router.replace('/')
    return null
  }

  const slice = lib[1].find(e => e.sliceName === router.query.sliceName)

  if (!slice) {
    router.replace('/')
    return null
  }

  const initialMockConfig = env.mockConfig[router.query.sliceName]

  const { model: initialModel, id: sliceId } = slice

  return (
    <ModelProvider
      initialModel={initialModel}
      remoteSlice={remoteSlices.find(e => e.id === sliceId)}
      initialMockConfig={initialMockConfig}
      info={slice}
    >
      { children }
    </ModelProvider>
  )
  return children
}
