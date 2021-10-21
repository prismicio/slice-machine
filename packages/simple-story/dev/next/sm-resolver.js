import { Fragment } from 'react'
import * as Slices from './slices'

const __allSlices = { ...Slices, }

const NotFound = ({ sliceName, slice, i }) => {
  console.error(`[sm-resolver] component "${sliceName}" not found at index ${i}.`)
  console.warn(`slice data: ${slice}`)
	return process.env.NODE_ENV !== 'production' ? (
    <div
      style={{
        height: '30vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        background: '#FAFAFA'
      }}
    >
      <h2>
        Slice "{sliceName}" not found.
      </h2>
      <p style={{ maxWidth: '320px', fontSize: '16px' }}>
        Check that you registered this component in your slices library!
      </p>
    </div>
  ) : <Fragment />
}

export default function SliceResolver({ sliceName, ...rest }) {
	return __allSlices[sliceName] ? __allSlices[sliceName] : function res() { return (<NotFound sliceName={sliceName} {...rest} />) }
}

  