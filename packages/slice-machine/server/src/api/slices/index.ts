import { getEnv } from '../../../../lib/env'

import DefaultClient from '../../../../lib/models/common/http/DefaultClient'
import FakeClient from '../../../../lib/models/common/http/FakeClient'

export const getSlices = async(client: DefaultClient | FakeClient) => {
  try {
    const res = await client.getSlice()
    if (res.status !== 200) {
      return { err: res, slices: [] }
    }
    const slices = await res.json()
    return { err: null, slices }
  } catch(e) {
    return { slices: [], err: e }
  }
}
export default async function handler() {
  const { env } = await getEnv()
  return await getSlices(env.client)
}