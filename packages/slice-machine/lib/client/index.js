import path from 'path'
import { maybeJsonFile } from '../utils'
import fakeApi from './fake'
import upload from './upload'

const SharedSlicesApi = {
  STAGE: 'https://customtypes.wroom.io/slices/',
  PROD: 'https://silo2hqf53.execute-api.us-east-1.amazonaws.com/prod/slices/'
}

const AclProviderApi = {
  STAGE: 'https://2iamcvnxf4.execute-api.us-east-1.amazonaws.com/stage/',
  PROD: 'https://gxm7zszu1f.execute-api.us-east-1.amazonaws.com/prod/'
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

const intiFetcher = (base, ApiUrls, devConfigArgs, repo, auth) => {
  const apiUrl = createApiUrl(base, ApiUrls)
  return createFetcher(
    ...devConfigArgs
      ? devConfigArgs
      : [apiUrl, repo, auth])
}

const initClient = ({ cwd, base, repo, auth }) => {
  if (!auth) {
    return fakeApi()
  }
  const devConfig = cwd ? maybeJsonFile(path.join(cwd, 'sm.dev.json')) : {}
  
  const apiFetcher = intiFetcher(base, SharedSlicesApi, devConfig.sharedSlicesApi, repo, auth)
  const aclFetcher = intiFetcher(base, AclProviderApi, devConfig.aclProviderApi, repo, auth)

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
      async createAcl() {
        return await aclFetcher(null, 'create', 'get')
      },
      async deleteFolder(body) {
        return await aclFetcher(body, 'delete-folder', 'post')
      },
      async post(params) {
        return upload(params)
      }
    }
  }
}

export default initClient
