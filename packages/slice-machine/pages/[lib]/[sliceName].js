import { useContext } from "react";
import { useRouter } from 'next/router'
import { LibContext } from "src/lib-context";
import ModelProvider from "src/model-context";

import Builder from 'lib/builder'

const SliceEditor = () => {
  const router = useRouter()
  const libraries = useContext(LibContext)

  const lib = libraries.find(e => e[0] === router.query.lib.replace(/--/g, "/"))

  if (!lib) {
    return <div>Library not found</div>
  }

  const component = lib[1].find(e => e.sliceName === router.query.sliceName)

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

export default SliceEditor