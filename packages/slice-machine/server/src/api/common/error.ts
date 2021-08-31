import { FakeResponse } from '@lib/models/common/http/FakeClient'

export const onError = (r: Response | FakeResponse | null, message = 'Unspecified error occured.') => ({
  err: r || new Error(message),
  status: r && r.status ? r.status : 500,
  reason: message,
})