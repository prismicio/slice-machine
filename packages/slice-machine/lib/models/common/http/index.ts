import DefaultClient from './DefaultClient'
import FakeClient from './FakeClient'

function initClient(cwd: string, base: string, repo?: string, auth?: string): DefaultClient | FakeClient {
  if (!auth || !repo || Math.random()) {
    return new FakeClient()
  }
  return new DefaultClient(cwd, base, repo, auth)
}

export default initClient