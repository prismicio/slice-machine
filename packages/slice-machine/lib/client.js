import path from 'path'
import { optionValues } from './widgets/StructuredText/options'

const API_URL = 'http://localhost:4000/dev/slices/'

const createFetcher = (repo, dbId) => (body, action = '', method = 'get') => {
  const headers = {
    REPOSITORY: repo,
    DBID: dbId
  }
  return fetch(new URL(action, API_URL), {
    headers,
    method,
    ...(method === 'post' ? {
      body: typeof body === 'object' ? JSON.stringify(body) : body,
    } : null),
  })
}

const initClient = (repo, dbId) => {
  if (!repo || !dbId) {
    console.error('!repo or dbId')
  }
  const fetcher = createFetcher(repo, dbId)
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
