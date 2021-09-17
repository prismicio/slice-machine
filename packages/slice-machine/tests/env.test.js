import fs from "fs"
import { Volume } from "memfs"

import { getEnv } from '../lib/env'
import { createWarnings } from '../server/src/api/state'
import { warningStates, SupportedFrameworks } from '../lib/consts'

const TMP = '/tmp'

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

test("it throws if no sm.json file is found", async () => {
  fs.use(Volume.fromJSON({}, TMP))
  await expect(getEnv(TMP)).rejects.toThrow()
})

test("it throws if no package.json file is found", async () => {
  fs.use(Volume.fromJSON({
    "sm.json": "{}"
  }, TMP))
  await expect(getEnv(TMP)).rejects.toThrow()
})

test("it fails because api endpoint is missing", async () => {
  fs.use(Volume.fromJSON({
    "sm.json": "{}",
    "package.json": "{}"
  }, TMP))

  await expect(getEnv(TMP)).rejects.toThrow()
})

test("it fails because api endpoint is invalid 1/2", async () => {
  fs.use(Volume.fromJSON({
    "sm.json": `{ "apiEndpoint": "https://wroom.io/api/v2" }`,
    "package.json": "{}"
  }, TMP))

  await expect(getEnv(TMP)).rejects.toThrow()
})

test("it fails because api endpoint is invalid 2/2", async () => {
  fs.use(Volume.fromJSON({
    "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api" }`,
    "package.json": "{}"
  }, TMP))

  await expect(getEnv(TMP)).rejects.toThrow()
})

test("it generates warning for missing stories path", async () => {
  fs.use(Volume.fromJSON({
    "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2" }`,
    "package.json": "{}"
  }, TMP))

  const { env } = await getEnv(TMP)
  expect(env.hasGeneratedStoriesPath).toEqual(false)
})

test("it generates warning for missing storybook config", async () => {
  fs.use(Volume.fromJSON({
    "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2" }`,
    "package.json": "{}"
  }, TMP))

  const { errors } = await getEnv(TMP)
  expect(errors).toHaveProperty('storybook')
  expect(errors.storybook.message).toEqual('Could not find storybook property in sm.json')
})

test("it validates stories path 1/3", async () => {
  fs.use(Volume.fromJSON({
    "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2" }`,
    "package.json": "{}",
    ".storybook/main.js": `import { getStoriesPaths } from '...'`
  }, TMP))

  const { env } = await getEnv(TMP)
  expect(env.hasGeneratedStoriesPath).toEqual(true)
})

test("it validates stories path 2/3", async () => {
  fs.use(Volume.fromJSON({
    "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2" }`,
    "package.json": "{}",
    "nuxt.config.js": `import { getStoriesPaths } from '...'`
  }, TMP))

  const { env } = await getEnv(TMP)
  expect(env.hasGeneratedStoriesPath).toEqual(true)
})

test("it validates stories path 3/3", async () => {
  fs.use(Volume.fromJSON({
    "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2" }`,
    "package.json": "{}",
    "nuxt.config.js": `stories: [".slicemachine/assets"]`
  }, TMP))

  const { env } = await getEnv(TMP)
  expect(env.hasGeneratedStoriesPath).toEqual(true)
})

test("it finds the right Prismic repo", async () => {
  fs.use(Volume.fromJSON({
    "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2" }`,
    "package.json": "{}",
    "nuxt.config.js": `stories: [".slicemachine/assets"]`
  }, TMP))

  const { env } = await getEnv(TMP)
  expect(env.repo).toEqual("api")
})

test("it creates empty mock config", async () => {
  fs.use(Volume.fromJSON({
    "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2" }`,
    "package.json": "{}",
    "nuxt.config.js": `stories: [".slicemachine/assets"]`
  }, TMP))

  const { env } = await getEnv(TMP)
  expect(env.mockConfig).toEqual({})
})

test("it gets current mock config", async () => {
  fs.use(Volume.fromJSON({
    "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2" }`,
    "package.json": "{}",
    "nuxt.config.js": `stories: [".slicemachine/assets"]`,
    ".slicemachine/mock-config.json": `{ "field": "value" }`
  }, TMP))

  const { env } = await getEnv(TMP)
  expect(env.mockConfig).toHaveProperty('field')
})

/** nuxt: 'nuxt',
  next: 'next',
  vue: 'vue',
  react: 'react'
  none: null
  
  */
test("it finds the right framework in manifest", async () => {
  const frameworkEntries = Object.entries(SupportedFrameworks)

  for await (const framework of frameworkEntries) {
    fs.reset()
    const [key, value] = framework
    fs.use(Volume.fromJSON({
      "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2", "storybook": "localhost:6666" }`,
      "package.json": `{ "scripts": { "storybook": "start-storybook" }, "dependencies": { "${key}": "1.1.0" } }`,
      "nuxt.config.js": `stories: [".slicemachine/assets"]`,
      ".slicemachine/mock-config.json": `{ "field": "value" }`
    }, TMP))
    const { env } = await getEnv(TMP)
    expect(env.framework).toEqual(value)
  }
})

test("it uses framework defined in manifest", async () => {
  const key = "vue"
  fs.reset()
  fs.use(Volume.fromJSON({
    "sm.json": `{ "framework": "${key}", "apiEndpoint": "https://api.wroom.io/api/v2", "storybook": "localhost:6666" }`,
    "package.json": `{ "scripts": { "storybook": "start-storybook" }, "dependencies": { "react": "1.1.0" } }`,
    "nuxt.config.js": `stories: [".slicemachine/assets"]`,
    ".slicemachine/mock-config.json": `{ "field": "value" }`
  }, TMP))
  const { env } = await getEnv(TMP)
  expect(env.framework).toEqual(key)
})

test("it defaults to vanilla framework if not found in manifest", async () => {
  fs.reset()
  fs.use(Volume.fromJSON({
    "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2", "storybook": "localhost:6666" }`,
    "package.json": `{ "scripts": { "storybook": "start-storybook" }, "dependencies": { "unknown": "1.1.0" } }`,
    "nuxt.config.js": `stories: [".slicemachine/assets"]`,
    ".slicemachine/mock-config.json": `{ "field": "value" }`
  }, TMP))

  const { env } = await getEnv(TMP)
  expect(env.framework).toEqual("vanillajs")
})

test("it generates storybook not in manifest warning", async () => {
  fs.use(Volume.fromJSON({
    "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2" }`,
    "package.json": "{}",
    "nuxt.config.js": `stories: [".slicemachine/assets"]`,
    ".slicemachine/mock-config.json": `{ "field": "value" }`
  }, TMP))

  const { env, errors } = await getEnv(TMP)
  const warnings = await createWarnings(env, errors)
  expect(warnings[0]).toHaveProperty('key')
  expect(warnings[0]).toHaveProperty('title')
  expect(warnings[0]).toHaveProperty('description')

  expect(warnings[0].key).toEqual(warningStates.STORYBOOK_NOT_IN_MANIFEST)
})

test("it generates storybook not installed warning", async () => {
  fs.use(Volume.fromJSON({
    "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2", "storybook": "localhost:6666" }`,
    "package.json": "{}",
    "nuxt.config.js": `stories: [".slicemachine/assets"]`,
    ".slicemachine/mock-config.json": `{ "field": "value" }`
  }, TMP))

  const { env, errors } = await getEnv(TMP)
  const warnings = await createWarnings(env, errors)
  expect(warnings[0]).toHaveProperty('key')
  expect(warnings[0]).toHaveProperty('title')
  expect(warnings[0]).toHaveProperty('description')

  expect(warnings[0].key).toEqual(warningStates.STORYBOOK_NOT_INSTALLED)
})

test("it generates storybook not running warning", async () => {
  fs.use(Volume.fromJSON({
    "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2", "storybook": "localhost:6666" }`,
    "package.json": `{ "scripts": { "storybook": "start-storybook" }}`,
    "nuxt.config.js": `stories: [".slicemachine/assets"]`,
    ".slicemachine/mock-config.json": `{ "field": "value" }`
  }, TMP))

  const { env, errors } = await getEnv(TMP)
  const warnings = await createWarnings(env, errors)
  expect(warnings[0]).toHaveProperty('key')
  expect(warnings[0]).toHaveProperty('title')
  expect(warnings[0]).toHaveProperty('description')

  expect(warnings[0].key).toEqual(warningStates.STORYBOOK_NOT_RUNNING)
})

