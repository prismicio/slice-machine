import { useContext, useEffect } from 'react'
import { Box } from 'theme-ui'
import { LibrariesContext } from 'src/models/libraries/context'
import { SliceZoneAsArray } from 'lib/models/common/CustomType/sliceZone'

import SliceState from '../../../models/ui/SliceState'
import LibraryState from '../../../models/ui/LibraryState'

import EmptyState from './EmptyState'

import List from './components/List'

const mapAvailableAndSharedSlices = (sliceZone: SliceZoneAsArray, libraries: ReadonlyArray<LibraryState>) => {
  const availableSlices: ReadonlyArray<SliceState> = libraries.reduce((acc, curr) => {
    return [...acc, ...curr.components.map(e => e[0])]
  }, [])
  const { slicesInSliceZone, notFound } : { slicesInSliceZone: ReadonlyArray<SliceState>, notFound: ReadonlyArray<{key: string}>} = sliceZone.value.reduce((acc, { key }) => {
    const maybeSliceState = availableSlices.find((state) => state.infos.meta.id === key)
    if (maybeSliceState) {
      return { ...acc, slicesInSliceZone: [...acc.slicesInSliceZone, maybeSliceState] }
    }
    return { ...acc, notFound: [...acc.notFound, { key }]}
  }, { slicesInSliceZone: [], notFound: [] })
  return { availableSlices, slicesInSliceZone, notFound }
}

const SliceZone = ({
  sliceZone,
  onAddSharedSlice,
  onRemoveSharedSlice,
}: {
  sliceZone: SliceZoneAsArray,
  onAddSharedSlice: Function,
  onRemoveSharedSlice: Function,
  onDelete: Function
}) => {
  const libraries = useContext(LibrariesContext)

  const { availableSlices, slicesInSliceZone, notFound } = mapAvailableAndSharedSlices(sliceZone, libraries)

  useEffect(() => {
    if (notFound?.length) {
      notFound.forEach(({ key }) => {
        onRemoveSharedSlice(key)
      })
    }
  }, [notFound])
  
  return (
    <Box mb={6}>
      <List
        onAddSharedSlice={onAddSharedSlice}
        availableSlices={availableSlices}
        onRemoveSharedSlice={onRemoveSharedSlice}
        slicesInSliceZone={slicesInSliceZone}
      />
    </Box>
  )
}

export default SliceZone
