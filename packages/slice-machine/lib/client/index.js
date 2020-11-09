import fakeApi from './fake'

const STAGE = 'https://4b7a9w5244.execute-api.us-east-1.amazonaws.com/stage/slices/'
const PROD = 'https://silo2hqf53.execute-api.us-east-1.amazonaws.com/prod/slices/'

const createApiUrl = (base) => {
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
  console.log({ apiUrl, repo, auth })
  return fetch(new URL(action, apiUrl), {
    headers,
    method,
    ...(method === 'post' ? {
      body: typeof body === 'object' ? JSON.stringify(body) : body,
    } : null),
  })
}

const initClient = (base, repo, auth) => {
  if (!auth) {
    return fakeApi()
  }
  const apiUrl = createApiUrl(base)
  const fetcher = createFetcher(apiUrl, repo, auth)
  return {
    async get() {
      return await fetcher()
    },
    async insert(body) {
      return await fetcher(body, 'insert', 'post')
    },
    async update(body) {
      return await fetcher(body, 'update', 'post')
    }
  }
}

export default initClient
