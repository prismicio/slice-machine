import equal from 'fast-deep-equal'
import { listComponentsByLibrary } from '../../lib/queries/listComponents'

import {
  slice as sliceSchema,
} from '../../lib/schemas'

import { pascalize } from 'sm-commons/utils/str'

export const getLibrairies = async (env) => {
  return await listComponentsByLibrary(env, env.libraries || []);
}

export const getLibrariesWithFlags = async (env) => {
  const res = await env.client.get()
  const remoteSlices = await res.json()

  const libraries = await listComponentsByLibrary(env)
  const withFlags = libraries.map(([lib, localSlices]) => {
    return [lib, localSlices.map(localSlice => {
      const sliceFound = remoteSlices.find(slice => localSlice.sliceName === pascalize(slice.id))
      const flagged = {
        ...localSlice,
        isNew: Boolean(!sliceFound),
        // check everything once online model matches fs model
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
export default async function handler(env) {
  const libraries = await getLibrariesWithFlags(env)
  if (libraries.err) {
    return { err: libraries }
  }
  return {
    libraries
  }
}
