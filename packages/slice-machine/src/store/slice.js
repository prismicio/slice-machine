import React from 'react'
import { useRouter } from 'next/router'

import { StoreContext } from './context'
import { useContext } from 'react'

import { useModelReducer } from './reducer'

export const SliceContext = React.createContext([])

export default function SliceProvider({ children, value }) {
  console.log({ value })
  const [Model, store] = useModelReducer(value)
  return (
    <SliceContext.Provider value={{ Model, store }}>
      { typeof children === 'function' ? children(value) : children }
    </SliceContext.Provider>
  )
}

export const SliceHandler = ({ env, children }) => {
  const router = useRouter()
  const libraries = useContext(StoreContext)
  if (!router.query || !router.query.lib || !router.query.sliceName) {
    return children
  }

  const lib = libraries.find(e => e[0] === router.query.lib.replace(/--/g, "/"))
  if (!lib) {
    router.replace('/')
    return null
  }

  const slice = lib[1].find(({ slice }) => slice.sliceName === router.query.sliceName)

  if (!slice) {
    router.replace('/')
    return null
  }

  return (
    <SliceProvider value={slice}>
      { children }
    </SliceProvider>
  )
}
