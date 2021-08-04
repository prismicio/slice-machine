const ALL_KEY = '__allSlices'

export const createDeclaration = (libs) => {
  const imports = libs.reduce((acc, { importName, from, isLocal }) => {
    if (isLocal) {
      return `${acc}import * as ${importName} from './${from}'\n`
    }
    return `${acc}import { Slices as ${importName} } from '${from}'\n`
  }, '')
  const spread = `const ${ALL_KEY} = { ${libs.reverse().reduce((acc, { importName }) => `${acc} ...${importName},`, '')} }`
  return `${imports}\n${spread}\n`
}

export const createBody = () =>
`const NotFound = ({ sliceName, slice, i }) => {
  console.error(\`[sm-resolver] component "\${sliceName}" not found at index \${i}.\`)
  console.warn(\`slice data: \${slice}\`)
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
  ) : null
}

export default function SliceResolver({ sliceName, ...rest }) {
	return __allSlices[sliceName] ? __allSlices[sliceName] : () => <NotFound sliceName={sliceName} {...rest} />
}
`