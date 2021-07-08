import fetchState from '../state'
import { handler as pushSlice } from '../slices/push'
import { handler as saveSlice } from '../slices/save'

import { onError } from '../common/error'
import Files from '../../../../lib/utils/files'
import { CustomTypesPaths } from '../../../../lib/models/paths'
import DefaultClient from '../../../../lib/models/common/http/DefaultClient'
import FakeClient from '../../../../lib/models/common/http/FakeClient'

import { ComponentWithLibStatus } from '../../../../lib/models/common/Library'
import { Tab, TabAsObject } from '../../../../lib/models/common/CustomType/tab'
import { CustomType } from '../../../../lib/models/common/CustomType'

const createOrUpdate = (client: DefaultClient | FakeClient, model: any, remoteCustomType: any) => {
  if (remoteCustomType) {
    return client.updateCustomType(model)
  }
  return client.insertCustomType(model)
}

export default async function handler(query: { id: string }) {
  const { id } = query

  const state = await fetchState()

  if (state.clientError || state.isFake) {
    const message = '[custom-types/push] Could not fetch remote custom types. Are you logged in to Prismic?'
    return {
      err: new Error(message),
      reason: message,
      status: 500
    }
  }

  const modelPath = CustomTypesPaths(state.env.cwd).customType(id).model()

  let model
  try {
    model = Files.readJson(modelPath)
  } catch(e) {
    const msg = `[custom-types/push] Model ${id} is invalid.`
    console.error(msg)
    return onError(null, msg)
  }

  const remoteCustomType = state.remoteCustomTypes.find((e: { id: string }) => e.id === id )
  if (remoteCustomType && remoteCustomType.repeatable !== model.repeatable) {
    const msg = `[custom-types/push] Model not pushed: property "repeatable" in local Model differs from remote source`
    console.error(msg)
    return onError(null, msg)
  }

  const sliceKeysToPush: string[] =[]
  for (let [, tab] of Object.entries(CustomType.fromJsonModel(model.id, model).tabs)) {
    const { sliceZone } = Tab.organiseFields(tab as TabAsObject)
    if (sliceZone?.value) {
      sliceKeysToPush.push(...new Set(sliceZone.value.map(e => e.key)))
    }
  }

  const localSlices: { [x: string]: ComponentWithLibStatus } = state.libraries.filter(e => e.isLocal).reduceRight((acc, curr) => {
    return {
      ...acc,
      ...curr.components.reduce((acc, curr) => ({
        ...acc,
        [curr.model.id]: curr
      }), {})
    }
  }, {})

  for await (const sliceKey of sliceKeysToPush) {
    const slice = localSlices[sliceKey]
    if (slice) {
      try {
        console.log('[custom-types/push] Saving slice', sliceKey)
        await saveSlice(
          state.env,
           {
            sliceName: slice.infos.sliceName,
            from: slice.from,
            model: slice.model,
            mockConfig: slice.infos.mock
          }
        )
        console.log('[custom-types/push] Pushing slice', sliceKey)
        await pushSlice(
          state.env,
          state.remoteSlices,
          { sliceName: slice.infos.sliceName, from: slice.from }
        )
      } catch(e) {
        console.error(`[custom-types/push] Full error: ${e}`)
      }
    }
  }

  console.log('[custom-types/push] Pushing Custom Type...')

  const res = await createOrUpdate(state.env.client, model, remoteCustomType)
  if (res.status > 209) {
    const message = res.text ? await res.text() : res.status.toString()
    const msg = `[custom-types/push] Unexpected error returned. Server message: ${message}`
    console.error(msg)
    return onError(null, msg)
  }

  console.log(`[custom-types/push] Custom Type ${id} was pushed!`)
  return {}
}