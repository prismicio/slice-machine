import path from 'path'

export const paths = (cwd: string, prefix: string) => ({
  value: () => path.join(cwd, prefix),
  customType: (id: string) => ({
    value: () => path.join(paths(cwd, prefix).value()),
    model:() => path.join(paths(cwd, prefix).value(), id, 'index.json'),
    mock:() => path.join(paths(cwd, prefix).value(), id, 'mocks.json'),
  }),
  library: (libraryName: string) => ({
    value: () => path.join(paths(cwd, prefix).value(), libraryName),
    slice: (sliceName: string) => ({
      value: () => path.join(paths(cwd, prefix).library(libraryName).value(), sliceName),
      preview: (filename: string = 'preview.png') =>path.join(paths(cwd, prefix).library(libraryName).slice(sliceName).value(), filename),
      stories: (filename: string = 'index.stories.js') => path.join(paths(cwd, prefix).library(libraryName).slice(sliceName).value(), filename),
      mocks: () => path.join(paths(cwd, prefix).library(libraryName).slice(sliceName).value(), 'mocks.json'),
      model: () => path.join(paths(cwd, prefix).library(libraryName).slice(sliceName).value(), 'model.json'),
      variation: (variationId: string) => ({
        value: () => path.join(paths(cwd, prefix).library(libraryName).slice(sliceName).value(), variationId),
        preview: (filename: string = 'preview.png') =>path.join(paths(cwd, prefix).library(libraryName).slice(sliceName).variation(variationId).value(), filename)
      })
    })
  })
})

export const GeneratedPaths = (cwd: string) => paths(cwd, path.join('.slicemachine', 'assets'))
export const CustomTypesPaths = (cwd: string) => paths(cwd, 'customtypes')
export const CustomPaths = (cwd: string) => paths(cwd, '')
export const PackagePaths = (cwd: string) => paths(cwd, 'node_modules')
export const SMConfig = (cwd: string) => path.join(cwd, 'sm.json')
export const Pkg = (cwd: string) => path.join(cwd, 'package.json')
export const YarnLock = (cwd: string) => path.join(cwd, 'yarn.lock')
export const MocksConfig = (cwd: string) => path.join(cwd, '.slicemachine', 'mocks.json')