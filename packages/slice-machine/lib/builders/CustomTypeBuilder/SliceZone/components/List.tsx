import { Fragment } from 'react'
import SliceState from '../../../../models/ui/SliceState'
import LibraryState from '../../../../models/ui/LibraryState'

import { Box } from 'theme-ui'


const List = ({
  onAddSharedSlice,
  onRemoveSharedSlice,
  availableSlices,
  slicesInSliceZone,
}: {
  onAddSharedSlice: Function,
  onRemoveSharedSlice: Function,
  availableSlices: ReadonlyArray<SliceState>,
  slicesInSliceZone: ReadonlyArray<SliceState>,
}) => {
  return (
    <Fragment>
      <div>
          <Box
            as="section"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gridGap: '16px',
              p: 0,
              pt: 4,
              mb: 3
            }}
          >
            {
              availableSlices.map((slice) => {
                const isInSliceZone = !!slicesInSliceZone.find((szSlice) => szSlice.infos.meta.id === slice.infos.meta.id)
                return (
                  <div
                    onClick={() => {
                      if (isInSliceZone) {
                        return onRemoveSharedSlice(slice.infos.meta.id)
                      }
                      onAddSharedSlice(slice.infos.meta.id)
                    }}
                    key={`${slice.from}-${slice.infos.sliceName}`}
                  >
                    {slice.infos.sliceName}<br/>
                    { isInSliceZone ? 'is in' : 'is not in'}
                  </div>
                )
              })
            }
          </Box>
        </div>
  </Fragment>
  )
}

export default List
