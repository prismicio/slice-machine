import React, { useEffect, useState } from 'react'
import equal from 'fast-deep-equal'
import { useRouter } from 'next/router'
import { useIsMounted } from 'react-tidy'

import createModel from '../lib/model'

export const ModelsContext = React.createContext([])

// [
//   ['slices', [model1, model2]]
// ]

export const ModelsHandler = ({ libraries, remoteSlices, env, children }) => {
  const router = useRouter()
  const isMounted = useIsMounted()
  const [models, setModels] = useState(libraries[0][1].map(slice => {
    const initialMockConfig = env.mockConfig[slice.sliceName]
    const { model: initialModel, id: sliceId } = slice
    const remoteSlice = remoteSlices.find(e => e.id === sliceId)
    return {
      id: sliceId,
      sliceName: slice.sliceName,
      from: slice.from,
      previewUrl: slice.previewUrl,
      model: createModel(initialModel, remoteSlice, slice, initialMockConfig)
    }
  }))

  console.log({ models: models.map(m => ({ ...m, model: { ...m.model, v: m.model.get() }})) })

  return (
    <ModelsContext.Provider
      value={models}
      setModels={setModels}
    >
      { children }
    </ModelsContext.Provider>
  )
}
