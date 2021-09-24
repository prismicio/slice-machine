import fs from 'fs'
import { Volume } from 'memfs'

import { createResolver } from '../src/features/resolver'

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

test("it correctly generates imports", async () => {
  fs.use(
    Volume.fromNestedJSON({
      'sm.json': `{ "libraries": ["@/slices", "@/some/slices", "essential_slices"] }`,
      node_modules: {
        essential_slices: {
          MySlices: {
            'index.js': 'console.log("hello")'
          }
        }
      },
      slices: {
        MySlice: {
          'index.js': 'console.log("hello")'
        }
      },
      some: {
        slices: {
          MySlice2: {
            'index.js': 'console.log("hello")'
          }
        }
      }
    }, '/test')
  )

  await createResolver('/test/sm.json')
  const resolver = fs.readFileSync('/test/sm-resolver.js', 'utf-8')
  expect(resolver.includes("import * as Slices from './slices'")).toBe(true)
  expect(resolver.includes("import * as Some_slices from './some/slices'")).toBe(true)
  expect(resolver.includes("import { Slices as EssentialSlices } from 'essential_slices'")).toBe(true)
})