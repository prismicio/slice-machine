import { getEnv } from '../../../../lib/env'
import Files from '../../../../lib/utils/files'

import DefaultClient from '../../../../lib/models/common/http/DefaultClient'
import FakeClient, { FakeResponse } from '../../../../lib/models/common/http/FakeClient'
import { CustomTypesPaths } from '../../../../lib/models/paths'

const onError = (r: Response | FakeResponse | null, message = 'An error occured while pushing slice to Prismic') => ({
  err: r || new Error(message),
  status: r && r.status ? r.status : 500,
  reason: message,
})

const getCustomTypes = async (client: DefaultClient | FakeClient) => {
  try {
    const res = await client.getCustomTypes()
    if (res.status !== 200) {
      return { err: res, customTypes: [] }
    }
    const customTypes = await res.json()
    return { err: null, customTypes }
  } catch(e) {
    return { customTypes: [], err: e }
  }
}

const createOrUpdate = (client: DefaultClient | FakeClient, model: any, remoteCustomType: any) => {
  if (remoteCustomType) {
    return client.updateCustomType(model)
  }
  return client.insertCustomType(model)
}

export default async function handler(query: { id: string }) {
  const { id } = query
  const { env } = await getEnv()
  const { customTypes, err } = await getCustomTypes(env.client)
  if (err) {
    console.error('[push] An error occured while fetching remote Custom Types.\nCheck that you\'re properly logged in and that you have access to the repo.')
    return onError(err, `Error ${err.status}: Could not fetch remote slices`)
  }

  const remoteCustomType = customTypes.find((e: { id: string }) => e.id === id )

  const modelPath = CustomTypesPaths(env.cwd).customType(id).model()
  const model = Files.readJson(modelPath)

  if (remoteCustomType && remoteCustomType.repeatable !== model.repeatable) {
    const msg = `[push] Model not saved: property "repeatable" in local Model differs from remote source`
    console.error(msg)
    return onError(null, `Error ${err.status}: Could not fetch remote slices`)
  }
  const res = await createOrUpdate(env.client, model, remoteCustomType)
  if (res.status > 209) {
    const message = res.text ? await res.text() : res.status.toString()
    const msg = `[push] Unexpected error returned. Server message: ${message}`
    console.error(msg)
    return onError(null, msg)
  }
  return {}
}