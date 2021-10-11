import {describe, expect, test, jest, afterEach} from '@jest/globals'
import inquirer from 'inquirer';
import {
  maybeExistingRepo,
  promptForCreateRepo,
  prettyRepoName,
  CREATE_REPO,
} from '../src/steps/maybe-existing-repo'

import nock from 'nock'

describe('maybe-existing-repo', () => {

  afterEach(() => {
    jest.restoreAllMocks()
  })


  test('prompts user to select a repo', async () => {
    const repoName = 'test'
    const base = 'https://prismic.io'

    jest.spyOn(inquirer, 'prompt').mockResolvedValue({repoName})
    const result = await promptForCreateRepo(base)

    expect(inquirer.prompt).toHaveBeenCalledTimes(1)
    expect(result).toBe(repoName)
  })

  test('if user has no repos it asks them to create a repo', async () => {
    const repoName = 'test'
    const base = 'https://prismic.io'
    const authUrl = 'https://auth.prismic.io'
    const cookies = 'prismic-auth=biscuits;'

    nock(authUrl)
    .get('/validate?token=biscuits')
    .reply(200, {
      email: "fake@prismic.io",
      type:"USER",
      repositories:"{}"
    })

    jest.spyOn(inquirer, 'prompt').mockResolvedValue({repoName})
    
    const result = await maybeExistingRepo(cookies, base)

    expect(inquirer.prompt).toHaveBeenCalledTimes(1)
    expect(result).toEqual(repoName)
  })

  test('it allows a user to create a new repo', async () => {
    const repoName = 'test'
    const base = 'https://prismic.io'
    const authUrl = 'https://auth.prismic.io'
    const cookies = 'prismic-auth=biscuits;'

    nock(authUrl)
    .get('/validate?token=biscuits')
    .reply(200, {
      email: "fake@prismic.io",
      type:"USER",
      repositories: JSON.stringify({dbid: "foo", role: "Owner"})
    })

    jest.spyOn(inquirer, 'prompt')
    .mockResolvedValueOnce({repoName: CREATE_REPO})
    .mockResolvedValueOnce({ repoName })

    const result = await maybeExistingRepo(cookies, base)
    expect(inquirer.prompt).toHaveBeenCalledTimes(2)
    expect(result).toEqual(repoName)

  })
})

describe("prettyRepoName", () => {
  test('should contain the base url, and a placeholder', () => {
    const address = new URL('https://prismic.io')
    const result = prettyRepoName(address)
    expect(result).toContain('repo-name')
    expect(result).toContain('.prismic.io')
  })

  test('should contain the base url, and a placeholder', () => {
    const address = new URL('https://prismic.io')
    const result = prettyRepoName(address)
    expect(result).toContain('repo-name')
    expect(result).toContain('.prismic.io')
  })

  test('shohuld contain the value from user input', () => {
    const address = new URL('https://prismic.io')
    const result = prettyRepoName(address, 'foo-bar')
    expect(result).toContain('foo-bar')
    expect(result).toContain('.prismic.io')
  })
})