export interface FakeResponse {
  status: number
  statusText: string
  fake: boolean
  json?: () => []
  error?: string
}

export default class FakeClient {
  private mutate: () => { status: number, statusText: string, fake: boolean, err: string }
  
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

  isFake() {
    return true;
  }
}