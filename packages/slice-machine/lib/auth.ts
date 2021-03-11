import os from 'os'
import fs from 'fs'
import path from 'path'
import { ok, err, Result } from 'neverthrow'

import Auth from './models/common/Auth'
import PrismicFile from './models/common/PrismicFile'
import PrismicData from './models/common/PrismicData'
import ErrorWithStatus from './models/common/ErrorWithStatus'

const AUTH_KEY = "prismic-auth"

// https://gist.github.com/rendro/525bbbf85e84fa9042c2
function parseCookies(cookies: string): { [key: string]: unknown } {
  return cookies.split(';')
    .reduce((res, c) => {
      const [key, val] = c.trim().split('=').map(decodeURIComponent)
      const allNumbers = (str: string) => /^\d+$/.test(str);
      try {
        return Object.assign(res, {
          [key]: allNumbers(val) ? val : JSON.parse(val)
        })
      } catch (e) {
        return Object.assign(res, {
          [key]: val
        })
      }
    }, {})
}

export function parseAuth(cookies = ''): Result<Auth, ErrorWithStatus> {
  const parsed = parseCookies(cookies)
  if (parsed[AUTH_KEY]) {
    return ok({ auth: parsed[AUTH_KEY] as string })
  }
  return err(new ErrorWithStatus(`Could not find cookie "${AUTH_KEY}" in ~/.prismic file`, 400))
}

export function parsePrismicFile(): Result<PrismicFile, ErrorWithStatus> {
  const home = os.homedir()
  try {
    const prismic = path.join(home, '.prismic')
    if (!fs.existsSync(prismic)) {
      return err(new ErrorWithStatus('~/.prismic file not found. Please log in to Prismic.', 401))
    }
    const { cookies, base } = JSON.parse(fs.readFileSync(prismic, 'utf-8'))
    return ok({ cookies, base })
  } catch(e) {
    return err(new ErrorWithStatus('Could not parse file at ~/.prismic. Are you logged in to Prismic?', 500))
  }
}

export function getPrismicData(): Result<PrismicData, ErrorWithStatus> {
  const result = parsePrismicFile()

  return result
    .map<PrismicData>(prismicFile => {
      const authResult = parseAuth(prismicFile.cookies)
      if(authResult.isOk()) return { base: prismicFile.base, auth: authResult.value }
      else return { base: prismicFile.base, authError: authResult.error }
    })
    .mapErr<ErrorWithStatus>(err => err)
}