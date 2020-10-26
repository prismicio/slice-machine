import { getConfig } from '../../lib/config'
import initClient from '../../lib/client'

const { config } = getConfig()

export const getSlices = async() => {
  try {
    const client = initClient(config.repo, config.auth)
    const res = await client.get()
    if (res.status !== 200) {
      return { err: res, slices: [] }
    }
    const slices = await res.json()
    return { err: null, slices }
  } catch(e) {
    console.error('[api/slices] An error occured while fetching slices. Note that when stable, this should break!')
    return { slices: [] }
  }
}
export default async function handler() {
  return await getSlices()
}