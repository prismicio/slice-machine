import { auth } from '../../lib/auth'

export default async function handler() {
  return auth()
}