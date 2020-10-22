import equal from 'fast-deep-equal'
import { listComponentsByLibrary } from '../../lib/queries/listComponents'

import initClient from '../../lib/client'
import {
  slice as sliceSchema,
} from '../../lib/schemas'

import { pascalize } from 'sm-commons/utils/str'

import { getConfig } from '../../lib/config'

const { config, errors } = getConfig()
const client = initClient(config.repo, config.auth)

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

export const getLibrairies = async (config) => {
  return await listComponentsByLibrary(config, config.libraries || []);
}

export const getLibrariesWithFlags = async (config) => {
  const res = await client.get()
  if (res.status !== 200) {
    console.error('Could not fetch remote slices. Continuing...')
    // return { err: res, reason: 'Could not fetch remote slices', status: res.status }
  }
  const remoteSlices = res.status !== 200 ? [] : await res.json()

  const libraries = await getLibrairies(config)
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
          status: 200,
          isValid: false,
          reason: e
        }
      }
    })]
  })
  return withFlags
}
export default async function handler() {
  const { config } = getConfig()
  const libraries = await getLibrariesWithFlags(config)
  if (libraries.err) {
    return { err: libraries }
  }
  return {
    libraries,
    config,
    errors
  }
}
