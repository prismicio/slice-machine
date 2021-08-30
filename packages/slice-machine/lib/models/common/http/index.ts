import DefaultClient from './DefaultClient'
import FakeClient from './FakeClient'

export async function ping(cwd: string, base: string, repo?: string, auth?: string) {
  if (!auth) {
    return {
      connected: false,
      reason: `Auth string was not found in ~/.prismic`
    }
  }
  if (!repo) {
    return {
      connected: false,
      reason: `Property "apiEndpoint" not found in ./sm.json`
    }
  }
  const client = new DefaultClient(cwd, base, repo, auth)
  const res = await client.getSlice()
  if (res.status > 209) {
    return {
      connected: false,
      reason: `Could not connect to Prismic API (endpoint: ${repo}, base: ${base})`
    }
  }
  return {
    connected: true,
    reason: ``
  }
}

function initClient(cwd: string, base: string, repo?: string, auth?: string): DefaultClient | FakeClient {
  if (!auth || !repo) {
    return new FakeClient()
  }
  return new DefaultClient(cwd, base, repo, auth)
}

export default initClient