const API_URL = 'https://4b7a9w5244.execute-api.us-east-1.amazonaws.com/stage/slices/'

const createFetcher = (repo, auth) => (body, action = '', method = 'get') => {
  const headers = {
    repository: repo,
    Authorization: `Bearer ${auth}`
  }
  return fetch(new URL(action, API_URL), {
    headers,
    method,
    ...(method === 'post' ? {
      body: typeof body === 'object' ? JSON.stringify(body) : body,
    } : null),
  })
}

const initClient = (repo, auth) => {
  if (!auth) {
    throw new Error('Could not instantiate API client: token not found.')
  }
  const fetcher = createFetcher(repo, auth)
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
