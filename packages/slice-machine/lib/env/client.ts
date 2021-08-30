import Auth from '../models/common/Auth'
import { getPrismicData } from '../auth'
import DefaultClient from '../models/common/http/DefaultClient'

export async function ping(cwd: string, repo?: string) {
  const prismicData = getPrismicData()
  console.log({ prismicData })
  if (!prismicData.isOk()) {
    return {
      connected: false,
      reason: `Could not parse ~/.prismic file`
    }
  }
  if (prismicData.value.authError) {
    return {
      connected: false,
      reason: `Could not parse ~/.prismic prismic-auth string`
    }
  }
  if (!repo) {
    return {
      connected: false,
      reason: `Property "apiEndpoint" not found in ./sm.json`
    }
  }
  const authObject = prismicData.value.auth as Auth
  const client = new DefaultClient(cwd, prismicData.value.base, repo, authObject.auth)
  const res = await client.getSlice()
  if (res.status > 209) {
    return {
      connected: false,
      reason: `Could not connect to Prismic API (endpoint: ${repo}, base: ${prismicData.value.base})`
    }
  }
  return {
    connected: true,
    reason: ``
  }
}
