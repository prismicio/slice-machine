import * as inquirer from 'inquirer'
// import * as chalk from 'chalk'
const chalk = require('chalk')
import { Communication, Utils } from 'slicemachine-core'

export const CREATE_REPO = "$_CREATE_REPO" // not a valid domain name
const DEFAULT_BASE = Utils.CONSTS.DEFAULT_BASE

export function prettyRepoName(address: URL, value?: string) {
  const reponame = value ? chalk.cyan(value) : chalk.dim.cyan('repo-name')
  const msg = [
    chalk.dim(`${address.protocol}//`),
    reponame,
    chalk.dim(`.${address.hostname}`),
  ]
  return msg.join('')
}

export async function promptForCreateRepo(base: string): Promise<string> {
  const address = new URL(base)
  return inquirer.prompt([
    {
      name: 'repoName',
      message: "Name your Prismic repository",
      type: "input",
      required: true,
      transformer: (value) => prettyRepoName(address, value),
      async validate(name) {
        const result = await Communication.validateRepositoryName(name, base, false)
        return result === name || result
      },
    }
  ]).then(res => res.repoName)
}

export async function maybeExistingRepo(cookie: string, base = DEFAULT_BASE): Promise<string> {

  const repos = await Communication.listRepositories(cookie, base)

  if(repos.length === 0) return promptForCreateRepo(base)

  const res = await inquirer.prompt([
    {
      type: "list",
      name: "repoName",
      default: 0,
      required: true,
      message: "Connect a Prismic Repository or create a new one",
      choices: [
        {name: "Create a new Repository", value: CREATE_REPO},
        new inquirer.Separator("---- Use an existing Repository ----"),
        ...repos.map((d) => ({name: d, value: d})),
      ]
    }, 
  ])

  if(res.repoName === CREATE_REPO) return promptForCreateRepo(base)
  return Promise.resolve(res.repoName)
}