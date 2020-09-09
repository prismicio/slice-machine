import { useContext } from "react";
import { LibContext } from "src/lib-context";
import ModelProvider from "src/model-context";

import Builder from 'lib/builder'

const SliceEditor = ({ query }) => {
  const libraries = useContext(LibContext)

  const lib = libraries.find(e => e[0] === query.lib)

  if (!lib) {
    return <div>Library not found</div>
  }

  const component = lib[1].find(e => e.sliceName === query.sliceName)

  if (!component) {
    return <div>Component not found</div>
  }

  const { model: initialModel } = component

  return (
    <ModelProvider initialModel={initialModel} info={component}>
      <Builder />
    </ModelProvider>
  )
}

SliceEditor.getInitialProps = ({ query }) => {
  return {
    query
  }
};

export default SliceEditor