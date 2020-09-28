import { getConfig } from '../../lib/config'
import initClient from '../../lib/client'

const { config } = getConfig()
const client = initClient(config.repo, config.dbId)

export const getSlices = async() => {
  const res = await client.get()
  if (res.status !== 200) {
    return { err: res, slices: [] }
  }
  const slices = await res.json()
  return { err: null, slices }
}
export default async function handler() {
  return await getSlices()
}