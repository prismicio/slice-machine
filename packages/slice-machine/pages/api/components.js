import equal from 'fast-deep-equal'
import getConfig from "next/config";

import { listComponentsByLibrary } from 'lib/queries/listComponents'

import initClient from 'lib/client'
import {
  slice as sliceSchema,
  libraries as librariesSchema
} from 'lib/schemas'

import { pascalize } from 'sm-commons/utils/str'

const { publicRuntimeConfig: config } = getConfig()
const client = initClient('shared', config.dbId)

export const getLibrairies = async () => {
  return await listComponentsByLibrary(config.libraries || []);
}

export const getLibrairiesWithFlags = async () => {
  const res = await client.get()
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
        console.error(e)
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
export default async function handler(req, res) {
  const librairies = await getLibrairiesWithFlags()
  console.log('here', librairies)
  return res.status(200).json(librairies)
}