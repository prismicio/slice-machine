import { libraries } from 'slicemachine-core/build/libraries'
import * as FileSystem from 'slicemachine-core/build/filesystem'

export const getStaticProps = async () => {
  const cwd = process.cwd()
  const manifest = FileSystem.Manifest.retrieveManifest(cwd)
  if (manifest.exists && manifest.content?.libraries) {
    const loadedLibs = await libraries(cwd, manifest.content.libraries)
    return {
      props: {
        libraries: loadedLibs,
        cwd
      }
    }
  }
  return {
    props: {}
  }
}