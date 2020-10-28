import os from 'os'
import fs from 'fs'
import path from 'path'

const AUTH_KEY = "prismic-auth"

// https://gist.github.com/rendro/525bbbf85e84fa9042c2
const parseCookies = (cookies) => cookies.split(';')
  .reduce((res, c) => {
    const [key, val] = c.trim().split('=').map(decodeURIComponent)
    const allNumbers = str => /^\d+$/.test(str);
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

export const getCookies = () => {
  const home = os.homedir()
  try {
    const prismic = path.join(home, '.prismic')
    const { cookies, base } = JSON.parse(fs.readFileSync(prismic, 'utf-8'))
    return { cookies, base }
  } catch(e) {
    return { err: e, reason: 'Could not parse cookies at ~/.prismic. Are you logged in to Prismic?' }
  }
}

export const auth = () => {
  const { cookies, ...r } = getCookies()
  if (!cookies) {
    console.error(r.reason)
    return null
  }
  const parsed = parseCookies(cookies)
  if (parsed[AUTH_KEY]) {
    return parsed[AUTH_KEY]
  }
  return null
}