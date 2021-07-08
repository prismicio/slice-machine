const TMP = '/tmp'
import fs from "fs"
import { Volume } from "memfs"

import { getEnv } from '../lib/env'
import { listComponentsByLibrary } from '../lib/queries/listComponents'

jest.mock(`fs`, () => {
  const fs = jest.requireActual(`fs`)
  const unionfs = require(`unionfs`).default
  unionfs.reset = () => {
    unionfs.fss = [fs]
  }
  return unionfs.use(fs)
})

afterEach(() => {
  fs.reset()
})

const commonExpect = async (env, prefix, libName, href) => {
  expect(env.userConfig.libraries).toEqual([`${prefix}${libName}`])
  const libraries = await listComponentsByLibrary(env)
  expect(libraries.length).toEqual(1)
  expect(libraries[0].isLocal).toEqual(true)
  expect(libraries[0].name).toEqual(libName)
  expect(libraries[0].components.length).toEqual(1)
  const [component] = libraries[0].components

  expect(component.from).toEqual(libName)
  expect(component.href).toEqual(href || libName)
  expect(component.pathToSlice).toEqual(`./${libName}`)

  expect(component.infos.sliceName).toEqual('CallToAction')
  expect(component.infos.fileName).toEqual('index')
  expect(component.infos.isDirectory).toEqual(true)
  expect(component.infos.extension).toEqual('js')

  expect(component.migrated).toEqual(false)
}

test("it gets library info from @ path", async () => {
  const libName = 'slices'
  const prefix = '@/'
  fs.use(Volume.fromJSON({
    "sm.json": `{ "libraries": ["${prefix}${libName}"] }`,
    "package.json": "{}",
    "slices/CallToAction/index.js": "const A = 1"
  }, TMP))

  const { env } = await getEnv(TMP)
  await commonExpect(env, prefix, libName)

  
})

test("it gets library info from ~ path", async () => {
  const libName = 'slices'
  const prefix = '~/'
  fs.use(Volume.fromJSON({
    "sm.json": `{ "libraries": ["${prefix}${libName}"] }`,
    "package.json": "{}",
    "slices/CallToAction/index.js": "const A = 1"
  }, TMP))

  const { env } = await getEnv(TMP)
  await commonExpect(env, prefix, libName)
  
})

test("it gets library info from / path", async () => {
  const libName = 'slices'
  const prefix = '/'
  fs.use(Volume.fromJSON({
    "sm.json": `{ "libraries": ["${prefix}${libName}"] }`,
    "package.json": "{}",
    "slices/CallToAction/index.js": "const A = 1"
  }, TMP))

  const { env } = await getEnv(TMP)
  await commonExpect(env, prefix, libName)
  
})

test("it handles nested library info", async () => {
  const libName = 'slices/src/slices'
  const prefix = '~/'
  fs.use(Volume.fromJSON({
    "sm.json": `{ "libraries": ["${prefix}${libName}"] }`,
    "package.json": "{}",
    "slices/src/slices/CallToAction/index.js": "const A = 1"
  }, TMP))

  const { env } = await getEnv(TMP)
  await commonExpect(env, prefix, libName, 'slices--src--slices')
  
})

test("it finds non local libs", async () => {
  const libName = 'vue-essential-slices'
  const pathToSlice = `node_modules/${libName}/slices/CallToAction/index.js`
  fs.use(Volume.fromJSON({
    "sm.json": `{ "libraries": ["${libName}"] }`,
    "package.json": "{}",
    [pathToSlice]: "const A = 1"
  }, TMP))

  const { env } = await getEnv(TMP)
  expect(env.userConfig.libraries).toEqual([libName])
  const libraries = await listComponentsByLibrary(env)
  expect(libraries[0].isLocal).toEqual(false)
  expect(libraries[0].components[0].pathToSlice).toEqual(`${libName}/slices`)
  
})

test("it filters non existing libs", async () => {
  const libName = 'vue-essential-slices'
  fs.use(Volume.fromJSON({
    "sm.json": `{ "libraries": ["${libName}"] }`,
    "package.json": "{}",
  }, TMP))

  const { env } = await getEnv(TMP)
  expect(env.userConfig.libraries).toEqual([libName])
  const libraries = await listComponentsByLibrary(env)
  expect(libraries).toEqual([])
  
})