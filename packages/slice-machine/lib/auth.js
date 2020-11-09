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

export const parseAuth = (cookies = '') => {
  const parsed = parseCookies(cookies)
  if (parsed[AUTH_KEY]) {
    return { auth: parsed[AUTH_KEY] }
  }
  return { auth: null, authError: { status: 400, reason: `Could not find cookie "${AUTH_KEY}" in ~/.prismic file` } }
}

export const parsePrismicFile = () => {
  const home = os.homedir()
  try {
    const prismic = path.join(home, '.prismic')
    if (!fs.existsSync(prismic)) {
      return { err: { status: 400 }, reason: '~/.prismic file not found. Please log in to Prismic.' }
    }
    const { cookies, base } = JSON.parse(fs.readFileSync(prismic, 'utf-8'))
    return { cookies, base }
  } catch(e) {
    return { err: e, reason: 'Could not parse file at ~/.prismic. Are you logged in to Prismic?' }
  }
}

export const getPrismicData = () => {
  const { cookies, base, err, reason } = parsePrismicFile()
  if (err) {
    return { auth: null, authError: { err, reason } }
  }
  return {
    base,
    ...parseAuth(cookies),
  }
}