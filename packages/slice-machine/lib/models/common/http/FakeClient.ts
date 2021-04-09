export interface FakeResponse {
  status: number
  statusText: string
  fake: boolean
  json: () => []
  error?: string
  text?: () => ''
}

export default class FakeClient {
  private mutate: () => { status: number, statusText: string, fake: boolean, err: string, json: () => any }
  
  constructor() {
    this.mutate = () => ({
      status: 403,
      statusText: 'Unauthorized',
      fake: true,
      err: 'You are not connected to Prismic',
      json() {
        return []
      }
    })
  }
  
  async get(): Promise<FakeResponse> {
    return {
      status: 200,
      statusText: 'ok',
      fake: true,
      json() {
        return []
      }
    }
  }

  async insert(): Promise<FakeResponse> {
    return this.mutate()
  }

  async update(): Promise<FakeResponse> {
    return this.mutate()
  }

  images = {
    createAcl: async () => {
      return { status: 200, json() { return {} } }
    },
    deleteFolder: async () => {
      return { status: 200 }
    },
    post: async () => {
      return { status: 200 }
    } 
  }

  isFake() {
    return true;
  }
}