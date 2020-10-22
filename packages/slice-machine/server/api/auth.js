import { auth } from '../../lib/auth'

export default async function handler() {
  const token = auth()
  if (!token) {
    return {
      err: new Error(),
      reason: 'Could not parse cookies at ~/.prismic. Are you logged in to Prismic?'
    }
  }
  return { token }
}