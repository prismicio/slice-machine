import { useContext, useState } from 'react'
import { Box } from 'theme-ui'
import { LibrariesContext } from 'src/models/libraries/context'
import { SliceZoneAsArray } from 'lib/models/common/CustomType/sliceZone'
import { LibraryState } from 'lib/models/common/ui/LibraryState'

import EmptyState from './EmptyState'
import LibrariesList from '../../../../components/LibrariesList'

const SliceZone = ({ sliceZone, onCreate, onDelete }: { sliceZone: SliceZoneAsArray, onCreate: Function, onDelete: Function }) => {

  const [displayList, setDisplay] = useState(false)
  const libraries: ReadonlyArray<LibraryState> = useContext(LibrariesContext)
  const slices = libraries.reduce((acc, curr) => {
    return [...acc, curr.components.map(([e]) => e.infos)]
  }, [])

  return (
    <Box mb={6}>
      {
        !sliceZone ? (
          <EmptyState onCreate={onCreate} />
        ) : (
          <div>
            <h3>{ libraries ? 'Current Slices' : 'not hello'}</h3>
            <button onClick={() => onDelete()}>Delete SliceZone</button>
            <ul>
              {
                sliceZone.value.map(({ key }) => (
                  <li key={key}>{key}</li>
                ))
              }
            </ul>
            <hr />
            <h3>Available slices</h3>
            <button onClick={() => setDisplay(!displayList)}>display</button>
            {
              displayList ? (
                <LibrariesList libraries={libraries} />
              ) : null
            }
            {/* <ul>
              {
                slices.map(e => (
                  <li key={e.meta.id}>
                    <img src={Object.entries(e.previewUrls)[0][1].url} style={{ width: '80px', height: '80px'}} />
                  </li>
                ))
              }
            </ul> */}
          </div>
        )
      }
    </Box>
  )
}

export default SliceZone
