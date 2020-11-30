import { maybeJsonFile } from '../utils'
import fakeApi from './fake'

const SharedSlicesApi = {
  STAGE: 'https://4b7a9w5244.execute-api.us-east-1.amazonaws.com/stage/slices/',
  PROD: 'https://silo2hqf53.execute-api.us-east-1.amazonaws.com/prod/slices/'
}

const AclProviderApi = {
  STAGE: 'http://localhost:4403/dev',
  PROD: 'http://localhost:4403/dev'
}

const createApiUrl = (base, { STAGE, PROD }) => {
  if (base && base.includes('wroom.io')) {
    return STAGE
  }
  return PROD
}

const createFetcher = (apiUrl, repo, auth) => (body, action = '', method = 'get') => {
  const headers = {
    repository: repo,
    Authorization: `Bearer ${auth}`
  }
  return fetch(new URL(action, apiUrl), {
    headers,
    method,
    ...(method === 'post' ? {
      body: typeof body === 'object' ? JSON.stringify(body) : body,
    } : null),
  })
}

const initClient = ({ base, repo, auth }) => {
  if (!auth) {
    return fakeApi()
  }
  const devConfig = maybeJsonFile(path.join(cwd, 'sm.dev.json'))
  const apiUrl = devConfig.sharedSlicesApi || createApiUrl(base, SharedSlicesApi)
  const apiFetcher = devConfig.aclPriverApi ||createFetcher(apiUrl, repo, auth)

  const aclProviderUrl = createApiUrl(base, AclProviderApi)
  const aclFetcher = createFetcher(aclProviderUrl, repo, auth)

  return {
    async get() {
      return await apiFetcher()
    },
    async insert(body) {
      return await apiFetcher(body, 'insert', 'post')
    },
    async update(body) {
      return await apiFetcher(body, 'update', 'post')
    },
    images: {
      async createAcl(body) {
        return await aclFetcher(body, 'create', 'post')
      },
      async deleteFolder(body) {
        return await aclFetcher(body, 'delete-folder', 'post')
      }
    }
  }
}

export default initClient
