import React from 'react'
import { useRouter } from 'next/router'

import {LibrariesContext } from '../libraries/context'
import { useContext } from 'react'

export const SliceContext = React.createContext([])

function useModelReducer({ slice }) {
  const { model, ...rest } = slice
  const variations = createVariations(model)
  const[state, dispatch] = useReducer(Store.reducer(variations), {
    model,
    ...rest,
    variations
  })

  const store = new Store(dispatch)
  return [state, store]
}

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
  const libraries = useContext(LibrariesContext)
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
