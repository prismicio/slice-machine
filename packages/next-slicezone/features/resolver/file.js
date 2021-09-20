const ALL_KEY = "__allSlices";
const DEFAULT_IMPORTS_STRING = "import { Fragment } from 'react'";

export const createDeclaration = (libs) => {
  const imports = libs.reduce((acc, { name, from, isLocal }) => {
    if (isLocal) {
      return `${acc}import * as ${name} from './${from}'\n`;
    }
    return `${acc}import { Slices as ${name} } from '${
      isLocal ? `${from}` : from
    }'\n`;
  }, "");
  const spread = `const ${ALL_KEY} = { ${libs
    .reverse()
    .reduce((acc, { name }) => `${acc} ...${name},`, "")} }`;
  return `${DEFAULT_IMPORTS_STRING}\n${imports}\n${spread}\n`;
};

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
  ) : <Fragment />
}

export default function SliceResolver({ sliceName, ...rest }) {
	return __allSlices[sliceName] ? __allSlices[sliceName] : () => <NotFound sliceName={sliceName} {...rest} />
}
`;
