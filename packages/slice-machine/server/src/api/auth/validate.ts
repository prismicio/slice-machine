import { validate } from '@lib/env/client'

export default async function handler() {
  return validate()
}