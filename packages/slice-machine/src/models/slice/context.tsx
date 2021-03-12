import React, { useReducer } from 'react'
import { useRouter } from 'next/router'

import { LibrariesContext } from '../libraries/context'
import { useContext } from 'react'
import SliceStore from './store'
import { reducer } from './reducer'

import { SliceState } from '../../../lib/models/ui/SliceState'
import { ComponentWithLibStatus } from '../../../lib/models/common/Library'
import { Slice } from '../../../lib/models/common/Slice'
import { AsObject } from '../../../lib/models/common/Variation'

type ContextProps = {
  Model: ComponentWithLibStatus
  store: SliceStore
}
export const SliceContext = React.createContext<Partial<ContextProps>>({})

/**
 * remoteSlicesState
 * fsSlicesState
 */

export function useModelReducer({ slice, remoteSlice, mockConfig }: {slice: ComponentWithLibStatus, remoteSlice?: Slice<AsObject>, mockConfig: any }): [SliceState, SliceStore] {
  const { model, ...rest } = slice

  const variations = Slice.toArray(model).variations
  const initialState: SliceState = {
    jsonModel: model,
    ...rest,
    variations,
    mockConfig,
    initialMockConfig: mockConfig,
    remoteVariations: remoteSlice ? Slice.toArray(remoteSlice).variations : [],
    initialPreviewUrl: rest.infos.previewUrl,
    initialVariations: variations
  }
  const [state, dispatch] = useReducer(reducer, initialState)

  const store = new SliceStore(dispatch)

  return [state, store]
}

export default function SliceProvider({ children, value }: { children: any, value: any}) {
  const [Model, store] = value
  return (
    <SliceContext.Provider value={{ Model, store }}>
      { typeof children === 'function' ? children(value) : children }
    </SliceContext.Provider>
  )
}

export const SliceHandler = ({ children }: { children: any }) => {
  const router = useRouter()
  const libraries = useContext(LibrariesContext)
  if (!router.query || !router.query.lib || !router.query.sliceName) {
    return children
  }

  const libParam: string = (() => {
    const l = router.query.lib
    if(l instanceof Array) return l[0]
    else return l
  })() 
  const lib = libraries.find(l => l?.name === libParam.replace(/--/g, "/"))
  if (!lib) {
    router.replace('/')
    return null
  }

  const slice = lib.components.find(([state]) => state.infos.sliceName === router.query.sliceName)

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
