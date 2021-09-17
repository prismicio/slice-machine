import { getEnv } from '@lib/env'

export default async function handler() {
  return getEnv()
}