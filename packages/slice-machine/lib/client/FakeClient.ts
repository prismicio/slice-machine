import Client from './Client'

interface FakeResponse {
  status: number
  fake: boolean
  json?: () => []
  error?: string
}

export default class FakeClient implements Client<FakeResponse> {
  private mutate: () => { status: number, fake: boolean, err: string}
  
  constructor() {
    this.mutate = () => ({
      status: 403,
      fake: true,
      err: 'You are not connected to Prismic'
    })
  }
  
  async get(): Promise<FakeResponse> {
    return {
      status: 200,
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
}