import * as inquirer from 'inquirer'
import * as chalk from 'chalk'
import { Communication, Utils } from 'slicemachine-core'

const CREATE_REPO = "$_CREATE_REPO" // not a valid domain name
const DEFAULT_BASE = Utils.CONSTS.DEFAULT_BASE

export async function maybeExistingRepo(cookie: string, base = DEFAULT_BASE): Promise<string> {

  const repos = await Communication.listRepositories(cookie, base)

  const address = new URL(base)

  const {repoName} = await inquirer.prompt([
    {
      when() { return repos && repos.length > 0 },
      type: "list",
      name: "repoName",
      default: 0,
      required: true,
      message: "Connect a Prismic Repository or create a new one",
      choices: [
        {name: "Create a new Repository", value: CREATE_REPO},
        ...repos,
      ]
    }, {
      when(answers) { return answers.repoName === CREATE_REPO },
      name: 'repoName',
      message: "Name your Prismic repository",
      type: "input",
      required: true,
      transformer(value) {
        const reponame = value ? chalk.cyan(value) : chalk.dim.cyan('repo-name')
        const msg = [
          chalk.dim(`${address.protocol}//`),
          reponame,
          chalk.dim(`.${address.hostname}`),
        ]
        return msg.join('')
      },
      async validate(name) {
        const result = await Communication.validateRepositoryName(name, base, false)
        return result === name || result
      },
    }
  ]);

  return Promise.resolve(repoName)
}