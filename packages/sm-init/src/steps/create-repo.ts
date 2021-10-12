import { Communication, Utils } from "slicemachine-core";

const DEFAULT_BASE = Utils.CONSTS.DEFAULT_BASE

export async function createRepository(domain: string, cookies: string, framework?: string, base = DEFAULT_BASE): Promise<string> {

  const spinner = Utils.spinner('Creating Prismic Repository')
  spinner.start()

  return Communication.createRepository(domain, cookies, framework, base).then(res => {
    const addressUrl = new URL(base)
    addressUrl.hostname = `${res.data.domain || domain}.${addressUrl.hostname}`
    const address = addressUrl.toString()
    spinner.succeed(`We created your new repository ${address}`)
    return address
  }).catch(err => {
    spinner.fail()
    console.error(`Error creating repository ${domain}`)
    throw err
  })

}