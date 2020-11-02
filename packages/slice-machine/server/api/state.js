import fetchLibs from './libraries'
import { getEnv } from '../../lib/env'

export default async function handler() {
  const { env, errors: configErrors } = getEnv()
  const { libraries, err } = await fetchLibs(env)
  return { libraries, err, configErrors, env }
}