import React from 'react'

import { pascalize } from 'sm-commons/utils/str'
import EmptyState from './EmptyState'

export default ({ registry = {}, slices, endpoint, resolver = () => null }) => {
  if (!slices || !slices.length) {
    return process.env.NODE_ENV !== 'production'
      ? < EmptyState endpoint={endpoint} />
      : null
  }

  return slices.map((slice, i) => {
    const sliceName = pascalize(slice.slice_type)
    const maybeRegister = registry[sliceName]

    if (!maybeRegister) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`No component was registered for slice of type "${slice.slice_type}"`)
      }
      return null
    }

    const Component = typeof maybeRegister === 'object' ? resolver({ ...maybeRegister, slice, i }) : maybeRegister
    if (Component) {
      return <Component key={`slice-${i + 1}`} slice={slice}  i={i} />
    }
    return null
  })

}
