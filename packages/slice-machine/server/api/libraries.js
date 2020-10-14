import equal from 'fast-deep-equal'
import { listComponentsByLibrary } from '../../lib/queries/listComponents'

import initClient from '../../lib/client'
import {
  slice as sliceSchema,
} from '../../lib/schemas'

import { pascalize } from 'sm-commons/utils/str'

import { getConfig } from '../../lib/config'

const { config, errors } = getConfig()
const client = initClient(config.repo, config.dbId)

function timeout(ms, promise) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve({ status: 200, json() { return [] }})
    }, ms)
    promise.then((res) => {
      if (res.status > 209) {
        return resolve({ status: 200, json() { return [] }})
      }
      resolve(res)
    })
  })
}

export const getLibrairies = async () => {
  return await listComponentsByLibrary(config, config.libraries || []);
}

export const getLibrariesWithFlags = async () => {
  const res = await timeout(2000, client.get())
  if (res.status !== 200) {
    return { err: res, status: res.status }
  }
  const remoteSlices = await res.json()
  const libraries = await getLibrairies()
  const withFlags = libraries.map(([lib, localSlices]) => {
    return [lib, localSlices.map(localSlice => {
      const sliceFound = remoteSlices.find(slice => localSlice.sliceName === pascalize(slice.id))
      const flagged = {
        ...localSlice,
        isNew: Boolean(!sliceFound),
        // check everything once description is added to online model
        isModified: sliceFound && !equal(localSlice.model.variations, sliceFound.variations) ? true : false,
      }

      try {
        sliceSchema.validateSync(flagged)
        return {
          ...flagged,
          isValid: true
        }
      } catch (e) {
        // console.error(e)
        return {
          ...flagged,
          isValid: false,
          reason: e
        }
      }
    })]
  })
  return withFlags
}
export default async function handler() {
  const libraries = await getLibrariesWithFlags()
  return {
    libraries,
    config,
    errors
  }
}
