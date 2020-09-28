import { getConfig } from '../../lib/config'

export default async function handler() {
  return getConfig()
}