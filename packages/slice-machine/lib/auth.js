import os from 'os'
import fs from 'fs'
import path from 'path'

const AUTH_KEY = "MY_COOL_KEY"

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
    const { cookies } = JSON.parse(fs.readFileSync(prismic, 'utf-8'))
    return { cookies }
  } catch(e) {
    return { err: e, reason: 'Could not parse cookies at ~/.prismic. Are you logged in to Prismic?' }
  }
}

export const auth = () => {
  const { cookies, ...r } = getCookies()
  if (!cookies) {
    return r
  }
  const parsed = parseCookies(cookies)
  if (parsed[AUTH_KEY]) {
    return {
      isAuth: true,
      token: parsed[AUTH_KEY]
    }
  }
  return { isAuth: false, reason: `key "${AUTH_KEY}" was not found in ~/.prismic. Are you logged in to Prismic?` }
}